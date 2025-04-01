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
const distPublicDir = path.join(distDir, 'public');

// Create dist/public directory if it doesn't exist
if (!fs.existsSync(distPublicDir)) {
  fs.mkdirSync(distPublicDir, { recursive: true });
}

// Ensure netlify/functions directory exists
const functionsDir = path.join(rootDir, 'netlify/functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(path.join(rootDir, 'netlify/functions'), { recursive: true });
}

// Copy _redirects file to both dist and dist/public directories
console.log('Copying _redirects file...');
const redirectsSource = path.join(publicDir, '_redirects');
const redirectsDestDist = path.join(distDir, '_redirects');
const redirectsDestPublic = path.join(distPublicDir, '_redirects');

if (fs.existsSync(redirectsSource)) {
  fs.copyFileSync(redirectsSource, redirectsDestDist);
  fs.copyFileSync(redirectsSource, redirectsDestPublic);
  console.log('_redirects files copied successfully.');
} else {
  console.error('_redirects file not found in public directory.');
  // Create default _redirects file
  const redirectsContent = '/*  /index.html  200';
  fs.writeFileSync(redirectsDestDist, redirectsContent);
  fs.writeFileSync(redirectsDestPublic, redirectsContent);
  console.log('Default _redirects files created.');
}

// Copy all files from public to dist/public
console.log('Copying all files from public directory to dist/public...');
fs.readdirSync(publicDir).forEach(file => {
  const sourcePath = path.join(publicDir, file);
  const destPath = path.join(distPublicDir, file);
  
  if (fs.lstatSync(sourcePath).isDirectory()) {
    // If it's a directory, create it and copy contents recursively
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    // Simple recursive copy for directories (not handling deep nested structures)
    fs.readdirSync(sourcePath).forEach(nestedFile => {
      const nestedSourcePath = path.join(sourcePath, nestedFile);
      const nestedDestPath = path.join(destPath, nestedFile);
      
      if (!fs.lstatSync(nestedSourcePath).isDirectory()) {
        fs.copyFileSync(nestedSourcePath, nestedDestPath);
      }
    });
  } else {
    // If it's a file, copy it directly
    fs.copyFileSync(sourcePath, destPath);
  }
});

// Create index.html in dist/public if it doesn't exist
const indexHtmlPath = path.join(distPublicDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.log('Creating default index.html in dist/public...');
  const defaultIndexHtml = `<!DOCTYPE html>
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
  fs.writeFileSync(indexHtmlPath, defaultIndexHtml);
}

console.log('Files copy completed successfully.');