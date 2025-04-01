# TopBestGames - Gaming Platform

A responsive web application that showcases the best games across various genres with a fully functional admin panel.

## Features

- **Game Catalog**: Browse games by genre, popularity, and ratings
- **User Accounts**: Register, login, and manage personal profiles
- **Game Reviews**: Read and write reviews for games
- **Favorite Games**: Save and track your favorite games
- **Admin Panel**: Comprehensive management tools for administrators
  - Dashboard with analytics
  - User management
  - Content management
  - Review moderation
  - System settings

## Tech Stack

- **Frontend**:
  - React with TypeScript
  - TanStack Query for data fetching
  - Tailwind CSS for styling
  - Shadcn UI components
  - Wouter for client-side routing

- **Backend**:
  - Express.js API server
  - PostgreSQL database
  - Drizzle ORM for database interactions
  - Passport.js for authentication
  - Express-session for session management

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/topbestgames.git
   cd topbestgames
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Create a `.env` file in the root directory
   - Add your database connection details:
     ```
     DATABASE_URL=postgresql://user:password@localhost:5432/topbestgames
     SESSION_SECRET=your-random-secret-key
     ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:5000](http://localhost:5000) in your browser

## Project Structure

```
.
├── client/                # Frontend code
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and configs
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main application component
│
├── server/                # Backend code
│   ├── auth.ts            # Authentication setup
│   ├── index.ts           # Express server setup
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database interface
│   └── vite.ts            # Vite integration
│
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Database schema and types
│
├── netlify/               # Netlify deployment config
├── public/                # Static assets
└── scripts/               # Build and utility scripts
```

## Database Schema

The application uses the following primary data models:

- **Users**: User accounts and profile information
- **Games**: Game details, ratings, and metadata
- **Reviews**: User reviews for games
- **Favorites**: User's favorite games
- **Activity Logs**: System activity tracking
- **Analytics**: Usage statistics

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on deploying to Netlify.

## License

This project is licensed under the MIT License - see the LICENSE file for details.