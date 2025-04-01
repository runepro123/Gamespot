// scripts/copy-netlify-files.js
// This script copies necessary files from public to dist/public for Netlify deployment

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');
const distPublicDir = path.join(distDir, 'public');

// Create dist/public directory if it doesn't exist
if (!fs.existsSync(distPublicDir)) {
  fs.mkdirSync(distPublicDir, { recursive: true });
}

// Copy _redirects file
const redirectsPath = path.join(publicDir, '_redirects');
const distRedirectsPath = path.join(distDir, '_redirects');
const distPublicRedirectsPath = path.join(distPublicDir, '_redirects');

if (fs.existsSync(redirectsPath)) {
  console.log('Copying _redirects file to dist directory...');
  fs.copyFileSync(redirectsPath, distRedirectsPath);
  console.log('Copying _redirects file to dist/public directory...');
  fs.copyFileSync(redirectsPath, distPublicRedirectsPath);
} else {
  console.log('Creating _redirects file...');
  fs.writeFileSync(distRedirectsPath, '/*  /index.html  200');
  fs.writeFileSync(distPublicRedirectsPath, '/*  /index.html  200');
}

// Copy public directory contents to dist/public
console.log('Copying public directory contents to dist/public...');
if (fs.existsSync(publicDir)) {
  fs.readdirSync(publicDir).forEach(file => {
    const sourcePath = path.join(publicDir, file);
    const destPath = path.join(distPublicDir, file);
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      // If it's a directory, create it in dist/public and copy its contents
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      
      fs.readdirSync(sourcePath).forEach(nestedFile => {
        const nestedSourcePath = path.join(sourcePath, nestedFile);
        const nestedDestPath = path.join(destPath, nestedFile);
        
        if (!fs.lstatSync(nestedSourcePath).isDirectory()) {
          try {
            fs.copyFileSync(nestedSourcePath, nestedDestPath);
          } catch (error) {
            console.error(`Error copying ${nestedSourcePath}:`, error);
          }
        }
      });
    } else {
      // If it's a file and not the _redirects file (already copied), copy it
      if (file !== '_redirects') {
        try {
          fs.copyFileSync(sourcePath, destPath);
        } catch (error) {
          console.error(`Error copying ${sourcePath}:`, error);
        }
      }
    }
  });
}

// Create fallback index.html if it doesn't exist
const indexHtmlPath = path.join(distPublicDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.log('Creating fallback index.html in dist/public...');
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TopBestGames - Best Games Across All Genres</title>
    <meta name="description" content="Discover the top games across various genres, read reviews, and track your favorite games.">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 20px;
            text-align: center;
        }
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            min-height: 100vh;
        }
        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border-left-color: #09f;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="loading">
        <div class="spinner"></div>
        <h1>TopBestGames</h1>
        <p>Loading application...</p>
    </div>
    <script>
        // Redirect to the application root after a short delay
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    </script>
</body>
</html>`;
  fs.writeFileSync(indexHtmlPath, indexHtmlContent);
}

console.log('File copying completed successfully!');