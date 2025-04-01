# TopBestGames - Gaming Platform

A responsive gaming platform built with React, TypeScript, and PostgreSQL, showcasing the best games across various genres with a fully functional admin panel.

## Features

- **User Authentication**: Secure login and registration with proper password hashing
- **Game Catalog**: Browse games by genre, rating, or trending status
- **Reviews System**: Read and submit reviews for games
- **Favorites**: Save your favorite games to your profile
- **Responsive Design**: Optimized for all devices from mobile to desktop
- **Admin Panel**: Comprehensive management interface with:
  - Statistics dashboard
  - Game management
  - User management
  - Review moderation
  - Analytics with charts
  - Activity logs
  - Site settings

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/topbestgames.git
   cd topbestgames
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/topbestgames
   SESSION_SECRET=your_session_secret
   ```

4. Initialize the database:
   ```
   npm run db:push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:5000`

## Deployment

This application can be deployed to any hosting service that supports Node.js and PostgreSQL.

## License

MIT
