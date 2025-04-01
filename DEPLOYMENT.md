# Deployment Guide

This document provides instructions for deploying the application to Netlify.

## Prerequisites

1. A [Netlify account](https://app.netlify.com/signup)
2. A [PostgreSQL database](https://neon.tech) (Neon is recommended for serverless PostgreSQL)

## Environment Variables

The following environment variables must be set in Netlify's deployment settings:

- `DATABASE_URL`: The connection string for your PostgreSQL database
- `SESSION_SECRET`: A random string for encrypting session data

## Deployment Steps

### Option 1: Deploy directly from Git repository

1. Login to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Connect to your Git provider and select your repository
4. Configure the build settings:
   - Build command: `node scripts/build-netlify.js`
   - Publish directory: `dist`
5. Click "Advanced settings" and add the required environment variables
6. Click "Deploy site"

### Option 2: Deploy using the Netlify CLI

1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Login to Netlify: `netlify login`
3. Initialize your project: `netlify init`
4. Configure the build settings when prompted or accept the defaults from netlify.toml
5. Set the environment variables: `netlify env:set DATABASE_URL your-database-url`
6. Deploy the site: `netlify deploy --prod`

## Verify Deployment

After deployment:

1. Visit your Netlify site URL and make sure the application loads
2. Test user authentication to verify the database connection is working
3. Check the Netlify function logs to debug any backend issues

## Troubleshooting

- If you encounter 404 errors on page reloads, check that the redirects in `netlify.toml` and `public/_redirects` are correctly configured
- For issues with the serverless functions, check the function logs in the Netlify dashboard
- Database connectivity issues may require checking your database configuration and ensuring the DATABASE_URL is correct

## Updating the Deployment

Any new commits pushed to your repository's main branch will trigger automatic rebuilds and redeployment on Netlify.