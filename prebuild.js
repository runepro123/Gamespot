// prebuild.js - Script that runs before the build process
const fs = require('fs');
const path = require('path');

console.log('Running prebuild.js...');

// Ensure necessary directories exist
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
  console.log('Created public directory');
}

if (!fs.existsSync('./netlify/functions')) {
  fs.mkdirSync('./netlify/functions', { recursive: true });
  console.log('Created netlify/functions directory');
}

// Create _redirects file for proper SPA routing
const redirectsPath = './public/_redirects';
fs.writeFileSync(redirectsPath, `
# Netlify redirects
/api/*  /.netlify/functions/api/:splat  200
/*      /index.html                     200
`);
console.log('Created _redirects file for Netlify deployment');

// Create a script directory if it doesn't exist
if (!fs.existsSync('./scripts')) {
  fs.mkdirSync('./scripts', { recursive: true });
  console.log('Created scripts directory');
}

// Copy deploy script if it doesn't exist
const deployScriptPath = './deploy.js';
const deployScriptExists = fs.existsSync(deployScriptPath);

if (!deployScriptExists) {
  console.log('Creating deployment script...');
  
  // Execute the node deploy.js script
  const { execSync } = require('child_process');
  try {
    execSync('node deploy.js', { stdio: 'inherit' });
    console.log('Deployment script executed successfully');
  } catch (error) {
    console.error('Error executing deployment script:', error.message);
    // Continue anyway as this is just preparation
  }
}

console.log('Prebuild process completed!');