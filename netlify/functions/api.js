import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes.js';

const app = express();

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up all our routes
registerRoutes(app);

// Export the serverless function
export const handler = serverless(app);