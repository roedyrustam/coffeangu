const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const envConfigFile = `export const environment = {
  production: true,
  siteUrl: '${process.env.SITE_URL || 'https://cuppingnotes.online'}',
  firebase: {
    projectId: '${process.env.FIREBASE_PROJECT_ID}',
    appId: '${process.env.FIREBASE_APP_ID}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET}',
    apiKey: '${process.env.FIREBASE_API_KEY}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID}'
  }
};
`;

const dir = './src/environments';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

fs.writeFileSync(path.join(dir, 'environment.ts'), envConfigFile);
fs.writeFileSync(path.join(dir, 'environment.development.ts'), envConfigFile.replace('production: true', 'production: false'));

console.log('✅ Environment files generated successfully from .env');
