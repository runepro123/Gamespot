# Deploying TopBestGames to Render.com

This guide will help you deploy the TopBestGames application to Render.com.

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
   - **Name**: topbestgames (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install --production && npm run build`
   - **Start Command**: `node server.js`
   - Set these environment variables:
     - `NODE_ENV`: production
     - `DATABASE_URL`: (Your PostgreSQL connection string)
     - `SESSION_SECRET`: (A random secure string)
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

## Preparing Files for Deployment

Before pushing to your Git repository for deployment, follow these steps:

1. Make sure you've built the application:
   ```
   npm run build
   ```

2. If deploying manually (not using Blueprint), rename `render-package.json` to `package.json`:
   ```
   cp render-package.json package.json
   ```

3. Push all files to your Git repository:
   ```
   git add .
   git commit -m "Prepare for Render deployment"
   git push
   ```

## Troubleshooting

If you encounter the "Port scan timeout" error:

1. Make sure `server.js` is in the root directory
2. Ensure the server is properly binding to the port using:
   ```javascript
   server.listen(PORT, '0.0.0.0', () => {
     console.log(`Server listening on port ${PORT}`);
   });
   ```
3. Verify that the `start` command in Render is correctly set to `node server.js`
4. Check the logs in the Render dashboard for any specific errors

## Post-Deployment

After successful deployment:

1. The web service will be available at `https://your-service-name.onrender.com`
2. The first deployment may take several minutes to build and start
3. Check the Render logs for any issues or errors

## Important Notes

- Render's free tier may have sleep time after periods of inactivity
- Make sure your `DATABASE_URL` environment variable is correctly set
- For persistent file storage, use Render's disk service or a third-party storage solution