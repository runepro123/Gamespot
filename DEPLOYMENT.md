# Deploying TopBestGames to Netlify

This guide will help you deploy the TopBestGames application to Netlify.

## Prerequisites

1. A Netlify account
2. Your TopBestGames project code
3. A PostgreSQL database (like Neon, Supabase, or another hosted PostgreSQL service)
4. Git repository with your code (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Preparing Your Application

Run the deployment preparation script:

```bash
node deploy.js
```

This script creates several important files:
- `netlify.toml` - Configuration for Netlify build
- `netlify/functions/api.js` - Serverless function for backend
- `public/_redirects` - URL rewrite rules
- `scripts/build-netlify.js` - Build script for the application

### 2. Setting Up Your PostgreSQL Database

1. Create a PostgreSQL database on your preferred hosting provider.
2. Configure the database with the tables needed for the application.
3. Get the database connection string (will be used in environment variables).

### 3. Deploying to Netlify

#### Option 1: Deploy via Netlify UI

1. Login to your Netlify account
2. Click on "New site from Git"
3. Connect to your Git repository provider (GitHub, GitLab, or Bitbucket)
4. Select the repository with your TopBestGames code
5. Configure build settings:
   - Build command: `node scripts/build-netlify.js`
   - Publish directory: `dist/public`
6. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: A secure random string for session encryption
7. Click "Deploy site"

#### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize a new Netlify site:
   ```bash
   netlify init
   ```

4. Follow the prompts to:
   - Create a new site or connect to an existing one
   - Set up continuous deployment from your Git repository
   - Configure build settings

5. Set environment variables:
   ```bash
   netlify env:set DATABASE_URL "your-postgres-connection-string"
   netlify env:set SESSION_SECRET "your-secret-key"
   ```

6. Deploy the site:
   ```bash
   netlify deploy --prod
   ```

## Important Configuration Files

### netlify.toml

This file configures the build process and redirects:

```toml
[build]
  command = "node scripts/build-netlify.js"
  publish = "dist/public"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### public/_redirects

This file ensures proper routing for both the API and the Single Page Application:

```
# Netlify redirects
/api/*  /.netlify/functions/api/:splat  200
/*      /index.html                     200
```

## Database Schema Migration

For the first deployment, the database tables need to be created. You can use the Drizzle ORM to push your schema to the database:

```bash
npm run db:push
```

## Testing Your Deployment

1. Visit your deployed Netlify site (the URL will be provided after deployment)
2. Test user registration and login functionality
3. Ensure that all pages and features are working correctly
4. Check admin functionality if you've created an admin account

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify that the `DATABASE_URL` environment variable is correct
   - Ensure your database allows connections from Netlify (check firewall settings)
   - For databases that require SSL, make sure the connection string includes the proper SSL parameters

2. **Function Timeout**:
   - Netlify Functions have a 10-second timeout by default
   - Optimize slow queries or operations
   - Consider enabling functions background mode for long-running tasks

3. **Missing Environment Variables**:
   - Double-check that all required environment variables are set
   - Remember environment variables are case-sensitive

4. **Redirects Not Working**:
   - Verify that the `_redirects` file is in the publish directory
   - Check that the redirects syntax is correct

## Limits and Considerations

1. **Netlify Functions Limits**:
   - 125K requests per month on the free plan
   - 10-second execution timeout
   - 1024MB memory limit

2. **Database Connections**:
   - Serverless functions create new connections for each invocation
   - Consider using connection pooling or a serverless-friendly database service

3. **Cold Starts**:
   - Functions may experience "cold starts" which can add latency to requests
   - Consider keeping functions warm with scheduled pings for critical functionality

## Updating Your Deployment

To update your deployed application:

1. Make changes to your code
2. Commit and push to your Git repository
3. Netlify will automatically rebuild and deploy your site

For manual deployment:

```bash
netlify deploy --prod
```

## Further Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify Redirects Documentation](https://docs.netlify.com/routing/redirects/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)