import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

/**
 * Generate Sitemap dynamically
 */
app.get('/sitemap.xml', async (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = `${protocol}://${req.headers.host}`;
    const FIREBASE_PROJECT_ID = 'coffeescore-cupping-2024';
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

    const urls = [
      { loc: `${host}/`, priority: 1.0, changefreq: 'daily' },
      { loc: `${host}/community`, priority: 0.8, changefreq: 'hourly' },
      { loc: `${host}/pricing`, priority: 0.5, changefreq: 'monthly' },
      { loc: `${host}/login`, priority: 0.5, changefreq: 'monthly' }
    ];

    try {
      const cuppingsQuery = await fetch(`${baseUrl}:runQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'cuppings' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'isPublic' },
                op: 'EQUAL',
                value: { booleanValue: true }
              }
            },
            select: { fields: [{ fieldPath: '__name__' }] },
            limit: 1000
          }
        })
      });
      if (cuppingsQuery.ok) {
        const cuppings = await cuppingsQuery.json();
        for (const item of cuppings) {
          if (item.document?.name) {
            const id = item.document.name.split('/').pop();
            urls.push({ loc: `${host}/result/${id}`, priority: 0.7, changefreq: 'weekly' });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch cuppings for sitemap', e);
    }

    try {
      const profilesQuery = await fetch(`${baseUrl}/profiles?pageSize=1000`);
      if (profilesQuery.ok) {
        const profiles = await profilesQuery.json();
        if (profiles.documents) {
          for (const doc of profiles.documents) {
            const id = doc.name.split('/').pop();
            urls.push({ loc: `${host}/u/${id}`, priority: 0.6, changefreq: 'weekly' });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch profiles for sitemap', e);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html'
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
