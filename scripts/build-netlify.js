// build-netlify.js
// This script builds the project for Netlify deployment

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function runBuild() {
  try {
    console.log('Starting Netlify build process...');
    
    // Build the frontend
    console.log('Building Vite frontend...');
    await execAsync('npm run build', { cwd: rootDir });
    console.log('Frontend build completed.');
    
    // Copy Netlify specific files
    console.log('Copying Netlify configuration files...');
    await import('./copy-netlify-files.js');
    
    console.log('Build process completed successfully.');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

runBuild();