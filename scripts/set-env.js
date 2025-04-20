const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const environmentTemplate = (isProd) => `
export const environment = {
  production: ${isProd},
  firebaseConfig: {
    apiKey: '${process.env.NG_APP_API_KEY}',
    authDomain: '${process.env.NG_APP_AUTH_DOMAIN}',
    projectId: '${process.env.NG_APP_PROJECT_ID}',
    storageBucket: '${process.env.NG_APP_STORAGE_BUCKET}',
    messagingSenderId: '${process.env.NG_APP_MESSAGING_SENDER_ID}',
    appId: '${process.env.NG_APP_APP_ID}',
    measurementId: '${process.env.NG_APP_MEASUREMENT_ID}' // Optional
  }
};
`;

// Ensure the directory exists
const envDir = path.join(__dirname, '../src/environments');
if (!fs.existsSync(envDir)){
    fs.mkdirSync(envDir, { recursive: true });
}

// Write the environment files
fs.writeFileSync(path.join(envDir, 'environment.ts'), environmentTemplate(false));
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), environmentTemplate(true));
