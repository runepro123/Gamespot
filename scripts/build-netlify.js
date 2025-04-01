// build-netlify.js
// This script prepares the project for Netlify deployment

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure netlify/functions directory exists
const functionsDir = path.join(__dirname, '../netlify/functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

// Run the normal build process
console.log('Building the application...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Deployment package prepared successfully!');