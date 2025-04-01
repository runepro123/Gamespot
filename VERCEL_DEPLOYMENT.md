# Deploying Game Spotlight to Vercel

This guide will help you deploy the Game Spotlight API server to Vercel's serverless platform.

## Prerequisites

- A [Vercel](https://vercel.com) account
- PostgreSQL database (such as Neon, Supabase, or any PostgreSQL provider)
- The Game Spotlight codebase

## Setting Up for Vercel Deployment

The repository already includes the necessary configuration files for Vercel deployment:

1. `vercel.json` - Configures the build process and routing
2. `server-vercel.js` - A serverless-compatible version of the server

## Required Environment Variables

Make sure these environment variables are set in your Vercel project:

| Variable Name | Description |
|---------------|-------------|
| `DATABASE_URL` | Complete PostgreSQL connection string |
| `PGHOST` | PostgreSQL hostname |
| `PGUSER` | PostgreSQL username |
| `PGPASSWORD` | PostgreSQL password |
| `PGDATABASE` | PostgreSQL database name |
| `PGPORT` | PostgreSQL port (usually 5432) |
| `SESSION_SECRET` | Secret string for session encryption |
| `FRONTEND_URL` | URL of your frontend (for CORS) |

## Deployment Steps

### Using Vercel CLI (Recommended)

1. Install Vercel CLI if you haven't already:
   ```bash
   npm i -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. From the project directory, deploy:
   ```bash
   vercel
   ```

4. Follow the prompts to set up your project.

5. For subsequent deployments:
   ```bash
   vercel --prod
   ```

### Using Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Log in to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "New Project"

4. Import your repository

5. Configure the project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: Leave empty
   - Output Directory: Leave empty

6. Add all the environment variables listed above

7. Click "Deploy"

## Troubleshooting

### Database Connection Issues

If you experience database connection problems:

1. **Check Environment Variables:** Ensure that all database connection variables are set correctly.

2. **Verify Database Access:** Make sure your database allows connections from Vercel's IP addresses. Many database providers require you to explicitly whitelist the IPs or enable public access.

3. **Test the Database Connection:** Visit `/api/db-test` endpoint to check database connectivity details.

4. **Check Logs:** In the Vercel dashboard, navigate to your deployment and check the Function Logs for any errors.

### Session Issues

If users are being logged out frequently:

1. The serverless version uses an in-memory session store, which means sessions don't persist between invocations. For production, consider using:
   - JWT-based authentication instead of sessions
   - A Redis session store (requires additional setup)

## Limitations of Serverless Deployment

Be aware of these limitations when using Vercel's serverless platform:

1. **Cold Starts:** Functions may experience some latency after periods of inactivity
2. **Execution Time Limits:** Functions can run for a maximum of 10 seconds on Vercel's free plan
3. **Statelessness:** Serverless functions are stateless, so session data stored in memory won't persist
4. **Connection Pooling:** Databases connections are managed differently in serverless environments

## Database Schema and Migrations

When setting up a fresh deployment, make sure your database schema is properly initialized.

## Monitoring

Monitor your API using Vercel's built-in analytics dashboard.