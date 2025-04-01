// build-netlify.js
// This script prepares the project for Netlify deployment

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure netlify/functions directory exists
const functionsDir = path.join(__dirname, '../netlify/functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

// Run the normal build process
console.log('Building the application...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Deployment package prepared successfully!');