
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {
  "node_modules/rxjs/dist/esm/index.js": [
    "chunk-2WWVKKQB.js"
  ],
  "node_modules/rxjs/dist/esm/operators/index.js": [
    "chunk-L4I7IHBM.js"
  ],
  "node_modules/tesseract.js/src/index.js": [
    "chunk-JEZTFRLR.js"
  ],
  "src/app/components/analytics/analytics.component.ts": [
    "chunk-2GJHZQ6C.js"
  ],
  "src/app/components/pricing/pricing.component.ts": [
    "chunk-S442AY4M.js"
  ]
},
  assets: {
    'index.csr.html': {size: 10118, hash: '9b19312fd36216ba7e3dbf91910d321627106d64ef249e53cb864087b4103b70', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 2221, hash: 'e3833bb9588b3a8c316258c7a2da9eb57385fdc08d866dc36dd77fdd958794af', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-FQ7ICL5S.css': {size: 14360, hash: 'vCC9p6lLDGE', text: () => import('./assets-chunks/styles-FQ7ICL5S_css.mjs').then(m => m.default)}
  },
};
