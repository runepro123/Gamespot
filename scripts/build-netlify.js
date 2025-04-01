const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runBuild() {
  console.log('Starting Netlify build process...');
  
  // Run the normal build process
  await new Promise((resolve, reject) => {
    console.log('Building React app...');
    exec('npm run build', (error, stdout, stderr) => {
      if (error) {
        console.error('Error building React app:', error);
        return reject(error);
      }
      console.log(stdout);
      console.error(stderr);
      resolve();
    });
  });

  // Copy server files to netlify/functions
  await new Promise((resolve, reject) => {
    console.log('Setting up Netlify function...');
    exec('node scripts/copy-netlify-files.js', (error, stdout, stderr) => {
      if (error) {
        console.error('Error setting up Netlify function:', error);
        return reject(error);
      }
      console.log(stdout);
      console.error(stderr);
      resolve();
    });
  });

  console.log('Netlify build completed!');
}

runBuild().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});