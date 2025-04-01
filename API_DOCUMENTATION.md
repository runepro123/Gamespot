# TopBestGames API Documentation

This document provides information about the API endpoints available in the TopBestGames server.

## Server Information

The API server is built using Node.js and Express, and is configured as an ES module. When deploying or running the server:

- The server is built using ES module syntax (import/export) instead of CommonJS (require)
- The package.json includes `"type": "module"` to ensure proper ES module support
- The server binds to all network interfaces using `0.0.0.0` for cloud compatibility
- Health check endpoints are available at `/` and `/health` paths

## Base URL

When deployed on Render, your API will be available at:
```
https://topbestgames-api.onrender.com
```

## Authentication Endpoints

### Register a new user
- **URL**: `/api/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "password": "securepassword",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
  ```
- **Response**: User object (without password)

### Login
- **URL**: `/api/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "password": "securepassword"
  }
  ```
- **Response**: User object (without password)

### Logout
- **URL**: `/api/logout`
- **Method**: `POST`
- **Response**: Success message

### Get Current User
- **URL**: `/api/user`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: User object (without password)

## Game Endpoints

### Get All Games
- **URL**: `/api/games`
- **Method**: `GET`
- **Response**: Array of game objects

### Get Game by ID
- **URL**: `/api/games/:id`
- **Method**: `GET`
- **Response**: Game object

### Get Trending Games
- **URL**: `/api/games/trending`
- **Method**: `GET`
- **Response**: Array of top-rated game objects

### Get Featured Games
- **URL**: `/api/games/featured`
- **Method**: `GET`
- **Response**: Array of featured game objects

### Get Games by Genre
- **URL**: `/api/games/genre/:genre`
- **Method**: `GET`
- **Response**: Array of game objects with the specified genre

## Review Endpoints

### Get Reviews for a Game
- **URL**: `/api/games/:id/reviews`
- **Method**: `GET`
- **Response**: Array of review objects for the specified game

### Create a Review
- **URL**: `/api/reviews`
- **Method**: `POST`
- **Authentication**: Required
- **Body**:
  ```json
  {
    "gameId": 1,
    "rating": 4.5,
    "content": "This game is amazing!"
  }
  ```
- **Response**: Created review object

## Health Check Endpoints

### Root Path
- **URL**: `/`
- **Method**: `GET`
- **Response**: Simple text indicating the server is running

### Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Response**: JSON object with status information

## Response Formats

### Success Response
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com"
  // other fields specific to the endpoint
}
```

### Error Response
```json
{
  "message": "Error message describing what went wrong"
}
```

## Authentication

Most endpoints that modify data require authentication. To authenticate:

1. Send a POST request to `/api/login` with username and password
2. The server will set a session cookie that will be used for subsequent authenticated requests
3. Include credentials in your requests (for cross-origin requests)

## Cross-Origin Resource Sharing (CORS)

The API supports CORS for frontend applications. In production, you should set the `FRONTEND_URL` environment variable to restrict which origins can access your API.

## Rate Limiting

Currently, there are no rate limits implemented, but they may be added in the future.

## Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server-side issue)