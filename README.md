# TopBestGames Platform

A comprehensive gaming platform that showcases the best games across all genres with user management, reviews, and an admin dashboard.

## Features

- 🎮 **Game Listings**: Browse and discover top games across multiple genres
- 👤 **User Accounts**: Create accounts, manage profiles, and track favorite games
- ⭐ **Reviews and Ratings**: Read and write reviews for games
- 📱 **Responsive Design**: Works on mobile, tablet, and desktop devices
- 🔧 **Admin Dashboard**: Comprehensive tools for content management
- 📊 **Analytics**: Track usage and engagement metrics

## Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn/UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based auth with Passport.js
- **Deployment**: Replit and/or Netlify compatible

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (automatically provided in Replit)

### Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5000`

## Database Management

The application uses Drizzle ORM for database migrations and management. To apply database schema changes:

```bash
npm run db:push
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for both Replit and Netlify.

## Project Structure

```
├── client/            # Frontend React code
│   ├── src/           # Source files
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── lib/       # Utility functions
│   │   ├── pages/     # Page components
├── netlify/           # Netlify-specific configuration
├── public/            # Static assets
├── scripts/           # Build and utility scripts
├── server/            # Backend Express server
│   ├── auth.ts        # Authentication setup
│   ├── routes.ts      # API routes
│   ├── storage.ts     # Database interfaces
│   ├── vite.ts        # Vite integration
├── shared/            # Shared between client and server
│   └── schema.ts      # Database schema and types
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful UI components
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Drizzle ORM](https://orm.drizzle.team/) for the TypeScript ORM
- [Replit](https://replit.com/) for the development and deployment platform