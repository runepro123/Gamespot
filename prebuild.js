// prebuild.js
// Run this script before deployment to ensure all files are properly set up

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create necessary directories
const distDir = path.join(__dirname, 'dist');
const distPublicDir = path.join(distDir, 'public');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (!fs.existsSync(distPublicDir)) {
  fs.mkdirSync(distPublicDir, { recursive: true });
}

// Create the _redirects file
const redirectsContent = '/*  /index.html  200';
const redirectsPath = path.join(distDir, '_redirects');
fs.writeFileSync(redirectsPath, redirectsContent);

// Copy it to the public directory as well
const publicRedirectsPath = path.join(distPublicDir, '_redirects');
fs.writeFileSync(publicRedirectsPath, redirectsContent);

// Create a basic index.html in the dist/public directory
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

const indexHtmlPath = path.join(distPublicDir, 'index.html');
fs.writeFileSync(indexHtmlPath, indexHtmlContent);

console.log('Pre-build setup completed successfully.');