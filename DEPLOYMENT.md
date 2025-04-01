# Deployment Guide for TopBestGames

This document provides comprehensive instructions for deploying the TopBestGames application using either Replit or Netlify.

## Table of Contents

- [Deploying on Replit (Recommended)](#deploying-on-replit)
- [Deploying on Netlify](#deploying-on-netlify)
- [Setting up Environment Variables](#setting-up-environment-variables)
- [Database Configuration](#database-configuration)
- [Troubleshooting](#troubleshooting)

## Deploying on Replit

Replit offers the simplest deployment option as it handles both the frontend and backend, including the PostgreSQL database.

### Prerequisites

- Your project must be on Replit
- PostgreSQL database must be properly set up (this happens automatically in your Replit)

### Deployment Steps

1. Open your project on Replit
2. Click the "Run" button to make sure your application is working properly
3. Run the deploy preparation script:
   ```
   node deploy.js
   ```
4. Once that's complete, click on the "Deploy" button in the top right corner of the Replit interface
5. Follow the prompts to deploy your application
6. Your application will be deployed to a `.replit.app` domain

### Post-Deployment

- Your application will automatically use the PostgreSQL database that's already set up in your Replit
- The session management is configured to work seamlessly with your deployed application
- The application includes proper routing for SPA (Single Page Application) navigation

## Deploying on Netlify

### Prerequisites

- A GitHub, GitLab, or Bitbucket repository with your project
- PostgreSQL database (you can use services like Neon Database, Supabase, or any other PostgreSQL provider)

### Build Setup

This project includes the following configuration files for Netlify:

- `netlify.toml`: Configuration for build settings and redirects
- `netlify/functions/api.js`: Serverless function for API endpoints
- `public/_redirects`: SPA routing support

### Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Sign in to [Netlify](https://app.netlify.com/)
3. Click "New site from Git"
4. Select your Git provider and repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Environment Variables

Set up the following environment variables in Netlify's dashboard:

- `DATABASE_URL`: Your PostgreSQL connection string
- `SESSION_SECRET`: A random string for securing sessions
- `NODE_ENV`: Set to `production`
- `SITE_URL`: Your Netlify site URL (e.g., `https://your-site-name.netlify.app`)

## Setting up Environment Variables

### Required Environment Variables

Both deployment methods require the following environment variables:

- `DATABASE_URL`: The connection string for your PostgreSQL database
- `SESSION_SECRET`: A secure random string used for session encryption

### How to Set Up Environment Variables

#### On Replit

1. In your Replit project, click on the "Secrets" tab (lock icon in the sidebar)
2. Add each environment variable as a key-value pair
3. The values are automatically available to your application

#### On Netlify

1. Go to your site's dashboard on Netlify
2. Navigate to Site settings > Build & deploy > Environment
3. Click "Edit variables" and add each required variable
4. Deploy your site again for the changes to take effect

## Database Configuration

### PostgreSQL on Replit

Replit automatically provides a PostgreSQL database for your application. The connection details are available as environment variables:

- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`
- `DATABASE_URL`

### External PostgreSQL Services

If deploying outside of Replit, consider these PostgreSQL providers:

- [Neon](https://neon.tech): Offers a generous free tier with serverless PostgreSQL
- [Supabase](https://supabase.com): Provides PostgreSQL with additional features
- [Railway](https://railway.app): Simple deployment with PostgreSQL support
- [Heroku](https://heroku.com): Offers PostgreSQL add-ons (note: requires credit card for free tier)

## Troubleshooting

### Common Issues and Solutions

#### Deployment Fails on Netlify

**Issue**: Build fails during deployment
**Solution**: Check the build logs. Common issues include:
- Missing dependencies: Ensure all dependencies are in package.json
- Build command issues: Verify that the build command is working locally
- Environment variables: Make sure all required environment variables are set

#### Database Connection Issues

**Issue**: Application can't connect to the database
**Solution**:
- Verify the `DATABASE_URL` environment variable is correct
- Check that the database is accessible from your deployment environment
- For Netlify, ensure SSL is properly configured in the connection string

#### SPA Routing Issues

**Issue**: Page refreshes result in 404 errors
**Solution**:
- Check that the `_redirects` file is in the published directory
- Verify the `netlify.toml` redirects are correctly configured
- Ensure the Netlify function is properly set up

#### Session Management Issues

**Issue**: Users are logged out unexpectedly
**Solution**:
- Verify the SESSION_SECRET environment variable is set
- Check that the session store is properly configured
- Ensure cookies are being set with the correct domain and parameters

### Getting Help

If you encounter issues not covered in this guide:

1. Check the application logs
2. Search for similar issues in the documentation
3. For Replit-specific issues, check the Replit documentation
4. For Netlify-specific issues, check the Netlify community forums

## Additional Resources

- [Replit Documentation](https://docs.replit.com/)
- [Netlify Documentation](https://docs.netlify.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)