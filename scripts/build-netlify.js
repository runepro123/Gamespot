// scripts/build-netlify.js
// This script builds the application specifically for Netlify deployment

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const rootDir = path.resolve(__dirname, '..');
const netlifyFunctionsDir = path.join(rootDir, 'netlify', 'functions');
const distDir = path.join(rootDir, 'dist');
const distFunctionsDir = path.join(distDir, 'functions');

async function runBuild() {
  try {
    console.log('Starting Netlify build...');
    
    // 1. Run the standard build process
    console.log('Building frontend and backend...');
    await execAsync('npm run build');
    
    // 2. Create functions directory in dist if it doesn't exist
    if (!fs.existsSync(distFunctionsDir)) {
      fs.mkdirSync(distFunctionsDir, { recursive: true });
    }
    
    // 3. Copy Netlify functions to dist/functions
    console.log('Copying Netlify functions...');
    if (fs.existsSync(netlifyFunctionsDir)) {
      fs.readdirSync(netlifyFunctionsDir).forEach(file => {
        const sourcePath = path.join(netlifyFunctionsDir, file);
        const destPath = path.join(distFunctionsDir, file);
        
        // Only copy files, not directories
        if (!fs.lstatSync(sourcePath).isDirectory()) {
          fs.copyFileSync(sourcePath, destPath);
        }
      });
    }
    
    // 4. Create _redirects file
    console.log('Creating _redirects file...');
    const redirectsContent = `
/api/*  /.netlify/functions/api/:splat  200
/*      /index.html                     200
`;
    fs.writeFileSync(path.join(distDir, '_redirects'), redirectsContent.trim());
    
    // 5. Run the file copy script to ensure other assets are copied
    console.log('Running file copy script...');
    await execAsync('node scripts/copy-netlify-files.js');
    
    console.log('Netlify build completed successfully!');
    
  } catch (error) {
    console.error('Error during Netlify build:', error);
    process.exit(1);
  }
}

runBuild();