# Deployment Guide

This document provides instructions for deploying the TopBestGames application to various platforms.

## Preparing for Deployment

Before deploying, ensure you have:

1. Committed all your changes to version control
2. Set up any required environment variables 
3. Tested the application locally

## Required Environment Variables

The following environment variables must be set in your deployment environment:

```
DATABASE_URL=postgres://[username]:[password]@[host]:[port]/[database]
SESSION_SECRET=[random-secret-string]
```

## Deploying to Netlify

### Automatic Deployment from GitHub

1. Push your code to a GitHub repository
2. Log in to [Netlify](https://app.netlify.com/)
3. Click on "New site from Git"
4. Select GitHub and authenticate
5. Select your repository
6. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click "Deploy site"
8. Once deployed, go to "Site settings" > "Environment variables" and add the required environment variables

### Manual Deployment

1. Install the Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Build your project:
   ```
   npm run build
   ```

3. Deploy to Netlify:
   ```
   netlify deploy --prod
   ```

## Database Setup for Production

1. Create a PostgreSQL database on your preferred provider (e.g., Neon, Railway, Heroku, etc.)
2. Get the connection string in the format: `postgres://[username]:[password]@[host]:[port]/[database]`
3. Set the `DATABASE_URL` environment variable in your deployment platform
4. Run the database migration:
   ```
   NODE_ENV=production npm run db:push
   ```

## Post-Deployment Verification

After deploying, verify that:

1. The application loads correctly
2. User authentication works (login/register)
3. All pages render properly 
4. Database operations work as expected
5. The admin panel is accessible and functional

## Troubleshooting Common Issues

### Database Connection Issues

If you encounter database connection problems:
- Verify that the DATABASE_URL is correctly formatted
- Check if your database service allows connections from your deployment platform
- Confirm that the database user has the necessary permissions

### Authentication Issues

If authentication doesn't work:
- Verify that the SESSION_SECRET environment variable is set
- Check that the session configuration in server/auth.ts matches your deployment environment

### Styling or Asset Issues

If styles or assets aren't loading:
- Verify that the build process completed successfully
- Check the browser console for any 404 errors on asset requests
- Ensure paths in your code are relative and not absolute

## Rolling Back a Deployment

If you need to roll back to a previous version on Netlify:

1. Go to your site's "Deploys" page on Netlify
2. Find a previous working deployment
3. Click the three dots menu and select "Publish deploy"

This will revert your site to the selected deployment.