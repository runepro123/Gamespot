# Deploying TopBestGames API Server to Render.com

This guide will help you deploy the TopBestGames API server to Render.com. This is for server-only deployment without the frontend client.

## Prerequisites

1. A Render.com account
2. Your TopBestGames project code
3. Git repository with your code (GitHub, GitLab, etc.)

## Deployment Steps

### Option 1: Using the Render Dashboard (Manual)

1. Log in to your Render.com account
2. Click on the **New +** button and select **Web Service**
3. Connect your repository
4. Configure the service with the following settings:
   - **Name**: topbestgames-api (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - Set these environment variables:
     - `NODE_ENV`: production
     - `DATABASE_URL`: (Your PostgreSQL connection string)
     - `SESSION_SECRET`: (A random secure string)
     - `FRONTEND_URL`: (The URL where your frontend will be deployed)
5. Click **Create Web Service**

### Option 2: Using Blueprint (Recommended)

1. Make sure your repository contains the `render.yaml` file
2. In your Render dashboard, click **New +** and select **Blueprint**
3. Connect to the repository containing your TopBestGames code
4. Render will automatically detect the `render.yaml` file and set up the services
5. Review the configuration and click **Apply**

## Important Files for Render Deployment

The following files are critical for Render deployment:

1. `server.js` - The main entry point for the Render web service
2. `render.yaml` - Blueprint configuration for automatic deployment
3. `render-package.json` - Custom package.json for Render (rename to package.json when deploying directly)

## Setting Up the Database

### Option 1: Using Render PostgreSQL

1. In the Render dashboard, go to **New +** > **PostgreSQL**
2. Configure your database:
   - **Name**: topbestgames-db (or your preferred name)
   - **Database**: topbestgames
   - **User**: topbestgames_user
3. Create the database
4. Copy the internal connection string and use it as the `DATABASE_URL` environment variable for your web service

### Option 2: Using Blueprint

If you're using the provided `render.yaml`, the database will be created automatically.

## Preparing Files for Server-Only Deployment

Since you're deploying only the server-side API:

1. Make sure you have these key files in your repository:
   - `server.js` - Main API server file (using ES module syntax)
   - `render.yaml` - Configuration for Render
   - `render-package.json` - Required dependencies (with ES module configuration)

2. If deploying manually (not using Blueprint), rename `render-package.json` to `package.json`:
   ```
   cp render-package.json package.json
   ```
   
   Important: The package.json contains `"type": "module"` which configures Node.js to treat .js files as ES modules. This requires using ES module import/export syntax instead of CommonJS require().

3. Push all files to your Git repository:
   ```
   git add .
   git commit -m "Prepare for API server deployment"
   git push
   ```

> **Note:** No build step is required for the server-only deployment since there's no frontend code to compile.

## Troubleshooting

### Fixing "Port scan timeout" Error

If you encounter the "Port scan timeout reached, no open ports detected" error:

1. **Ensure server.js is properly configured**:
   - Make sure `server.js` is in the root directory
   - Verify the server is explicitly binding to all network interfaces:
   ```javascript
   server.listen(PORT, '0.0.0.0', () => {
     console.log(`Server listening on port ${PORT}`);
   });
   ```
   - Add a health check endpoint at the `/health` path:
   ```javascript
   app.get('/health', (req, res) => {
     res.status(200).json({ status: 'ok', message: 'Server is running' });
   });
   
   // And make sure the root path also returns a response
   app.get('/', (req, res) => {
     res.status(200).send('OK');
   });
   ```
   - If using ES modules (recommended), ensure your package.json has `"type": "module"` and your imports use ES module syntax:
   ```javascript
   // ES module imports (correct)
   import express from 'express';
   import { createServer } from 'http';

   // Instead of CommonJS imports (incorrect for ES modules)
   // const express = require('express');
   // const { createServer } = require('http');
   ```

2. **Update render.yaml configuration**:
   - Set a specific health check path: `healthCheckPath: /health`
   - Set an appropriate timeout: `healthCheckTimeout: 10000`
   - Mark the service as public: `public: true`

3. **Check environment variables**:
   - Ensure `PORT` is set (Render provides this automatically)
   - Make sure your app uses this environment variable with fallback: `const PORT = process.env.PORT || 3000;`

4. **Review build process**:
   - Verify that the `start` command in Render is correctly set to `node server.js`
   - Ensure build steps complete successfully
   
5. **Check deployment logs**:
   - Review logs in the Render dashboard for specific errors
   - Look for any error messages related to port binding

## Post-Deployment

After successful deployment:

1. The API server will be available at `https://topbestgames-api.onrender.com` (or your chosen name)
2. Test your API endpoints using a tool like Postman or curl commands:
   ```bash
   # Test the health endpoint
   curl https://topbestgames-api.onrender.com/health
   
   # Test the games endpoint
   curl https://topbestgames-api.onrender.com/api/games
   ```
3. Check the Render logs for any issues or errors

## Connecting a Frontend to Your API

To connect a frontend application to your deployed API:

1. Deploy your frontend separately (to Netlify, Vercel, or another hosting service)
2. Update the `FRONTEND_URL` environment variable in your Render service to match your frontend URL
3. Configure your frontend to make API requests to your Render API URL
4. Use CORS properly to allow requests from your frontend domain

## Important Notes

- Render's free tier has sleep time after periods of inactivity
- The first request after inactivity may be slow as the service wakes up
- Make sure your `DATABASE_URL` environment variable is correctly set
- Consider implementing proper authentication security for production use
- See API_DOCUMENTATION.md for a complete list of available endpoints