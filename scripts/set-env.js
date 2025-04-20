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

// Write the environment files
fs.writeFileSync('./src/app/environments/environment.ts', environmentTemplate(false));
fs.writeFileSync('./src/app/environments/environment.prod.ts', environmentTemplate(true));
