// deploy.js
// Run this script to prepare the application for deployment
// Usage: node deploy.js

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const distPublicDir = path.join(distDir, 'public');

async function deploy() {
  try {
    console.log('Starting deployment preparation...');
    
    // 1. Create necessary directories
    console.log('Creating directories...');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    if (!fs.existsSync(distPublicDir)) {
      fs.mkdirSync(distPublicDir, { recursive: true });
    }
    
    // 2. Create the _redirects file
    console.log('Creating _redirects files...');
    const redirectsContent = '/*  /index.html  200';
    
    // Add to public directory (for development)
    const publicRedirectsPath = path.join(publicDir, '_redirects');
    fs.writeFileSync(publicRedirectsPath, redirectsContent);
    
    // Add to dist directory (for production)
    const distRedirectsPath = path.join(distDir, '_redirects');
    fs.writeFileSync(distRedirectsPath, redirectsContent);
    
    // Add to dist/public directory (for extra safety)
    const distPublicRedirectsPath = path.join(distPublicDir, '_redirects');
    fs.writeFileSync(distPublicRedirectsPath, redirectsContent);
    
    // 3. Build the application
    console.log('Building the application...');
    await execAsync('npm run build');
    
    // 4. Copy files from public to dist/public
    console.log('Copying files from public to dist/public...');
    if (fs.existsSync(publicDir)) {
      fs.readdirSync(publicDir).forEach(file => {
        const sourcePath = path.join(publicDir, file);
        const destPath = path.join(distPublicDir, file);
        
        if (fs.lstatSync(sourcePath).isDirectory()) {
          // If it's a directory, create it in dist/public
          if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
          }
          
          // Copy files from the directory
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
    }
    
    // 5. Create fallback index.html in dist/public if it doesn't exist
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
    
    console.log('Deployment preparation completed successfully!');
    console.log('');
    console.log('To deploy your application:');
    console.log('1. Click on the "Deploy" button in the Replit interface');
    console.log('2. Follow the prompts to deploy your application');
    console.log('3. Your app will be deployed to a .replit.app domain');
    console.log('');
    console.log('Note: Your application will use the PostgreSQL database that\'s already set up in this Replit.');
    
  } catch (error) {
    console.error('Error during deployment preparation:', error);
    process.exit(1);
  }
}

deploy();