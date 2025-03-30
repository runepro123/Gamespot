import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, DatabaseStorage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertGameSchema, 
  insertReviewSchema, 
  insertUserSchema,
  insertFavoriteSchema 
} from "@shared/schema";
import { z } from "zod";

// Authorization middleware
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Admin authorization middleware
function isAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
}

// Register API routes
export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the database with seed data if needed
  if (storage instanceof DatabaseStorage) {
    await storage.seedInitialData();
  }
  
  // Setup authentication
  setupAuth(app);

  // Track visits for analytics
  app.use(async (req, res, next) => {
    // Skip API routes and static files
    if (!req.path.startsWith('/api') && !req.path.includes('.')) {
      const today = new Date();
      await storage.updateDailyAnalytics(today, { totalVisits: 1 });
    }
    next();
  });

  // Game Routes
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getAllGames();
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Error fetching games" });
    }
  });

  app.get("/api/games/trending", async (req, res) => {
    try {
      const trendingGames = await storage.getTrendingGames();
      res.json(trendingGames);
    } catch (error) {
      res.status(500).json({ message: "Error fetching trending games" });
    }
  });

  app.get("/api/games/featured", async (req, res) => {
    try {
      const featuredGames = await storage.getFeaturedGames();
      res.json(featuredGames);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured games" });
    }
  });

  app.get("/api/games/genre/:genre", async (req, res) => {
    try {
      const { genre } = req.params;
      const games = await storage.getGamesByGenre(genre);
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Error fetching games by genre" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const game = await storage.getGame(id);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Error fetching game" });
    }
  });

  app.post("/api/games", isAdmin, async (req, res) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      
      // Log activity
      await storage.createActivityLog({
        action: "Game Added",
        userId: req.user.id,
        details: `Added game: ${game.title}`
      });
      
      res.status(201).json(game);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating game" });
    }
  });

  app.patch("/api/games/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const gameData = req.body;
      
      const updatedGame = await storage.updateGame(id, gameData);
      
      if (!updatedGame) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Log activity
      await storage.createActivityLog({
        action: "Game Updated",
        userId: req.user.id,
        details: `Updated game: ${updatedGame.title}`
      });
      
      res.json(updatedGame);
    } catch (error) {
      res.status(500).json({ message: "Error updating game" });
    }
  });

  app.delete("/api/games/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const game = await storage.getGame(id);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      const deleted = await storage.deleteGame(id);
      
      if (deleted) {
        // Log activity
        await storage.createActivityLog({
          action: "Game Deleted",
          userId: req.user.id,
          details: `Deleted game: ${game.title}`
        });
        
        return res.sendStatus(204);
      }
      
      res.status(500).json({ message: "Error deleting game" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting game" });
    }
  });

  // Review Routes
  app.get("/api/games/:id/reviews", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByGame(gameId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews" });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const review = await storage.createReview(reviewData);
      
      // Log activity
      await storage.createActivityLog({
        action: "Review Submitted",
        userId: req.user.id,
        details: `Review for game ID ${reviewData.gameId} submitted`
      });
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating review" });
    }
  });

  app.get("/api/reviews/pending", isAdmin, async (req, res) => {
    try {
      const pendingReviews = await storage.getPendingReviews();
      res.json(pendingReviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching pending reviews" });
    }
  });
  
  // Get all reviews (for admin)
  app.get("/api/reviews/all", isAdmin, async (req, res) => {
    try {
      // Get all users to include in review data
      const users = await storage.getAllUsers();
      
      // Get all games to include in review data
      const games = await storage.getAllGames();
      
      // Get approved reviews for each game
      const allReviews = [];
      
      for (const game of games) {
        const gameReviews = await storage.getReviewsByGame(game.id);
        
        // Add game and user data to each review
        for (const review of gameReviews) {
          const user = users.find(u => u.id === review.userId);
          allReviews.push({
            ...review,
            game,
            user: user ? { 
              id: user.id, 
              username: user.username,
              fullName: user.fullName
            } : undefined
          });
        }
      }
      
      // Also include pending reviews
      const pendingReviews = await storage.getPendingReviews();
      
      for (const review of pendingReviews) {
        const game = games.find(g => g.id === review.gameId);
        const user = users.find(u => u.id === review.userId);
        
        // Only add if not already included (avoid duplicates)
        if (!allReviews.some(r => r.id === review.id)) {
          allReviews.push({
            ...review,
            game,
            user: user ? { 
              id: user.id, 
              username: user.username,
              fullName: user.fullName
            } : undefined
          });
        }
      }
      
      res.json(allReviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching all reviews" });
    }
  });

  app.patch("/api/reviews/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reviewData = req.body;
      
      const updatedReview = await storage.updateReview(id, reviewData);
      
      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      // Log activity
      const action = reviewData.isApproved ? "Review Approved" : "Review Rejected";
      await storage.createActivityLog({
        action,
        userId: req.user.id,
        details: `${action}: Review ID ${id}`
      });
      
      res.json(updatedReview);
    } catch (error) {
      res.status(500).json({ message: "Error updating review" });
    }
  });

  app.delete("/api/reviews/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteReview(id);
      
      if (deleted) {
        // Log activity
        await storage.createActivityLog({
          action: "Review Deleted",
          userId: req.user.id,
          details: `Deleted review ID ${id}`
        });
        
        return res.sendStatus(204);
      }
      
      res.status(404).json({ message: "Review not found" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting review" });
    }
  });

  // User Routes (Admin)
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.patch("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      
      // If updating password, hash it first
      if (userData.password) {
        userData.password = await require('./auth').hashPassword(userData.password);
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log activity
      await storage.createActivityLog({
        action: "User Updated",
        userId: req.user.id,
        details: `Updated user: ${updatedUser.username}`
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Don't allow deleting the current user
      if (id === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const deleted = await storage.deleteUser(id);
      
      if (deleted) {
        // Log activity
        await storage.createActivityLog({
          action: "User Deleted",
          userId: req.user.id,
          details: `Deleted user: ${user.username}`
        });
        
        return res.sendStatus(204);
      }
      
      res.status(500).json({ message: "Error deleting user" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Favorite Routes
  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const favorites = await storage.getFavoritesByUser(userId);
      
      // Get full game details for each favorite
      const favoritesWithGames = await Promise.all(
        favorites.map(async (favorite) => {
          const game = await storage.getGame(favorite.gameId);
          return { ...favorite, game };
        })
      );
      
      res.json(favoritesWithGames);
    } catch (error) {
      res.status(500).json({ message: "Error fetching favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if game exists
      const game = await storage.getGame(favoriteData.gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Check if already favorited
      const alreadyFavorite = await storage.isFavorite(favoriteData.userId, favoriteData.gameId);
      if (alreadyFavorite) {
        return res.status(400).json({ message: "Game already in favorites" });
      }
      
      const favorite = await storage.createFavorite(favoriteData);
      
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error adding favorite" });
    }
  });

  app.delete("/api/favorites/:gameId", isAuthenticated, async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const userId = req.user.id;
      
      // Find the favorite
      const favorites = await storage.getFavoritesByUser(userId);
      const favoriteToDelete = favorites.find(fav => fav.gameId === gameId);
      
      if (!favoriteToDelete) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      const deleted = await storage.deleteFavorite(favoriteToDelete.id);
      
      if (deleted) {
        return res.sendStatus(204);
      }
      
      res.status(500).json({ message: "Error removing favorite" });
    } catch (error) {
      res.status(500).json({ message: "Error removing favorite" });
    }
  });

  // Activity Log Routes (Admin)
  app.get("/api/activities", isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivityLogs(limit);
      
      // Enhance with user data
      const enhancedActivities = await Promise.all(
        activities.map(async (activity) => {
          if (activity.userId) {
            const user = await storage.getUser(activity.userId);
            if (user) {
              return {
                ...activity,
                user: {
                  id: user.id,
                  username: user.username,
                  fullName: user.fullName,
                  isAdmin: user.isAdmin
                }
              };
            }
          }
          return activity;
        })
      );
      
      res.json(enhancedActivities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activities" });
    }
  });

  // Analytics Routes (Admin)
  app.get("/api/analytics", isAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const analyticsData = await storage.getAnalytics(days);
      res.json(analyticsData);
    } catch (error) {
      res.status(500).json({ message: "Error fetching analytics" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
