import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes.js';

const app = express();

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Debugging middleware
app.use((req, res, next) => {
  console.log(`Netlify function received ${req.method} request to ${req.path}`);
  next();
});

// Set up all our routes
registerRoutes(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Netlify function error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Export the serverless function
export const handler = serverless(app, {
  binary: ['image/png', 'image/jpeg', 'image/gif', 'application/pdf']
});