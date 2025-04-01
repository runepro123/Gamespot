const express = require('express');
const serverless = require('serverless-http');
const app = express();
const { registerRoutes } = require('../../server/routes');

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up all our routes
registerRoutes(app);

// Export the serverless function
module.exports.handler = serverless(app);