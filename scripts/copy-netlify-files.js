// copy-netlify-files.js
// This script copies necessary Netlify configuration files to the build output

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');

// Ensure netlify/functions directory exists
const functionsDir = path.join(rootDir, 'netlify/functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(path.join(rootDir, 'netlify/functions'), { recursive: true });
}

// Copy _redirects file to dist directory
console.log('Copying _redirects file to dist directory...');
const redirectsSource = path.join(publicDir, '_redirects');
const redirectsDest = path.join(distDir, '_redirects');

if (fs.existsSync(redirectsSource)) {
  fs.copyFileSync(redirectsSource, redirectsDest);
  console.log('_redirects file copied successfully.');
} else {
  console.error('_redirects file not found in public directory.');
}

console.log('Netlify files preparation completed.');