import { 
  users, type User, type InsertUser,
  games, type Game, type InsertGame,
  reviews, type Review, type InsertReview,
  favorites, type Favorite, type InsertFavorite,
  activityLogs, type ActivityLog, type InsertActivityLog,
  analytics, type Analytics,
  genreEnum
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql, desc, eq, and } from "drizzle-orm";
import pg from "pg";
const { Pool } = pg;
import connectPg from "connect-pg-simple";
import session from "express-session";
import createMemoryStore from "memorystore";

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create DrizzleORM instance
const db = drizzle(pool);

// Session stores
const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;

  // Game operations
  getGame(id: number): Promise<Game | undefined>;
  getGameByTitle(title: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, game: Partial<Game>): Promise<Game | undefined>;
  getAllGames(): Promise<Game[]>;
  getFeaturedGames(): Promise<Game[]>;
  getTrendingGames(): Promise<Game[]>;
  getGamesByGenre(genre: string): Promise<Game[]>;
  deleteGame(id: number): Promise<boolean>;

  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<Review>): Promise<Review | undefined>;
  getReviewsByGame(gameId: number): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  getPendingReviews(): Promise<Review[]>;
  deleteReview(id: number): Promise<boolean>;

  // Favorite operations
  getFavorite(id: number): Promise<Favorite | undefined>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  deleteFavorite(id: number): Promise<boolean>;
  isFavorite(userId: number, gameId: number): Promise<boolean>;

  // Activity log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivityLogs(limit: number): Promise<ActivityLog[]>;

  // Analytics operations
  getAnalytics(days: number): Promise<Analytics[]>;
  updateDailyAnalytics(date: Date, data: Partial<Analytics>): Promise<Analytics>;

  // Session store for auth
  sessionStore: any; // Using any for session store to avoid typing issues
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private reviews: Map<number, Review>;
  private favorites: Map<number, Favorite>;
  private activityLogs: Map<number, ActivityLog>;
  private analyticsData: Map<number, Analytics>;
  
  private userIdCounter: number;
  private gameIdCounter: number;
  private reviewIdCounter: number;
  private favoriteIdCounter: number;
  private activityLogIdCounter: number;
  private analyticsIdCounter: number;
  
  sessionStore: any; // We need to use any to avoid typing issues

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.reviews = new Map();
    this.favorites = new Map();
    this.activityLogs = new Map();
    this.analyticsData = new Map();
    
    this.userIdCounter = 1;
    this.gameIdCounter = 1;
    this.reviewIdCounter = 1;
    this.favoriteIdCounter = 1;
    this.activityLogIdCounter = 1;
    this.analyticsIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
    
    // Create initial admin user
    this.createUser({
      username: "admin",
      password: "admin123", // This will be hashed in the auth service
      email: "admin@topbestgames.com",
      fullName: "Administrator",
      isAdmin: true,
      avatar: "",
    });
    
    // Seed some initial games for testing
    this.seedInitialGames();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Game methods
  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGameByTitle(title: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(
      (game) => game.title.toLowerCase() === title.toLowerCase()
    );
  }

  async createGame(gameData: InsertGame): Promise<Game> {
    const id = this.gameIdCounter++;
    const now = new Date();
    const game: Game = { 
      ...gameData, 
      id,
      rating: 0,
      createdAt: now, 
      updatedAt: now 
    };
    this.games.set(id, game);
    return game;
  }

  async updateGame(id: number, gameData: Partial<Game>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame = { 
      ...game, 
      ...gameData, 
      updatedAt: new Date() 
    };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async getAllGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getFeaturedGames(): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.isFeatured)
      .sort((a, b) => b.rating - a.rating);
  }

  async getTrendingGames(): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.isTrending)
      .sort((a, b) => b.rating - a.rating);
  }

  async getGamesByGenre(genre: string): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.genre === genre)
      .sort((a, b) => b.rating - a.rating);
  }

  async deleteGame(id: number): Promise<boolean> {
    return this.games.delete(id);
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const review: Review = { 
      ...reviewData, 
      id, 
      createdAt: now 
    };
    this.reviews.set(id, review);
    
    // Update game rating
    await this.updateGameRating(reviewData.gameId);
    
    return review;
  }

  async updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview = { ...review, ...reviewData };
    this.reviews.set(id, updatedReview);
    
    // Update game rating if the review is updated
    if (reviewData.rating || reviewData.isApproved !== undefined) {
      await this.updateGameRating(review.gameId);
    }
    
    return updatedReview;
  }

  async getReviewsByGame(gameId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.gameId === gameId && review.isApproved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPendingReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => !review.isApproved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deleteReview(id: number): Promise<boolean> {
    const review = this.reviews.get(id);
    if (!review) return false;
    
    const deleted = this.reviews.delete(id);
    if (deleted) {
      await this.updateGameRating(review.gameId);
    }
    
    return deleted;
  }

  // Helper to update a game's rating based on its reviews
  private async updateGameRating(gameId: number): Promise<void> {
    const game = await this.getGame(gameId);
    if (!game) return;
    
    const gameReviews = Array.from(this.reviews.values())
      .filter(review => review.gameId === gameId && review.isApproved);
    
    if (gameReviews.length === 0) {
      await this.updateGame(gameId, { rating: 0 });
      return;
    }
    
    const totalRating = gameReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = +(totalRating / gameReviews.length).toFixed(1);
    
    await this.updateGame(gameId, { rating: avgRating });
  }

  // Favorite methods
  async getFavorite(id: number): Promise<Favorite | undefined> {
    return this.favorites.get(id);
  }

  async createFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteIdCounter++;
    const now = new Date();
    const favorite: Favorite = { 
      ...favoriteData, 
      id, 
      createdAt: now 
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values())
      .filter(favorite => favorite.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deleteFavorite(id: number): Promise<boolean> {
    return this.favorites.delete(id);
  }

  async isFavorite(userId: number, gameId: number): Promise<boolean> {
    return Array.from(this.favorites.values())
      .some(favorite => favorite.userId === userId && favorite.gameId === gameId);
  }

  // Activity log methods
  async createActivityLog(logData: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogIdCounter++;
    const now = new Date();
    const log: ActivityLog = { 
      ...logData, 
      id, 
      createdAt: now 
    };
    this.activityLogs.set(id, log);
    return log;
  }

  async getRecentActivityLogs(limit: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Analytics methods
  async getAnalytics(days: number): Promise<Analytics[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return Array.from(this.analyticsData.values())
      .filter(data => new Date(data.date) >= date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async updateDailyAnalytics(date: Date, data: Partial<Analytics>): Promise<Analytics> {
    // Format date to remove time component for comparison
    const dateStr = date.toISOString().split('T')[0];
    
    // Find if we already have analytics for this date
    const existingAnalytics = Array.from(this.analyticsData.values())
      .find(a => a.date.toISOString().split('T')[0] === dateStr);
    
    if (existingAnalytics) {
      const updated = { 
        ...existingAnalytics, 
        ...data, 
        totalVisits: (existingAnalytics.totalVisits || 0) + (data.totalVisits || 0),
        newUsers: (existingAnalytics.newUsers || 0) + (data.newUsers || 0),
        activeUsers: (existingAnalytics.activeUsers || 0) + (data.activeUsers || 0)
      };
      this.analyticsData.set(existingAnalytics.id, updated);
      return updated;
    } else {
      const id = this.analyticsIdCounter++;
      const now = new Date();
      const newAnalytics: Analytics = { 
        id, 
        date, 
        totalVisits: data.totalVisits || 0, 
        newUsers: data.newUsers || 0, 
        activeUsers: data.activeUsers || 0,
        createdAt: now 
      };
      this.analyticsData.set(id, newAnalytics);
      return newAnalytics;
    }
  }

  // Seed some initial games for testing
  private seedInitialGames(): void {
    const genres = ["action", "adventure", "rpg", "strategy", "simulation", "sports"];
    const titles = [
      "Cyberpunk 2077",
      "Elden Ring",
      "God of War: Ragnarök",
      "Starfield",
      "The Legend of Zelda: TOTK",
      "Red Dead Redemption 2",
      "The Witcher 3: Wild Hunt"
    ];
    const developers = [
      "CD Projekt Red",
      "FromSoftware",
      "Santa Monica Studio",
      "Bethesda Game Studios",
      "Nintendo",
      "Rockstar Games",
      "CD Projekt Red"
    ];
    const descriptions = [
      "Open-world RPG set in a dystopian future where body modification has become commonplace.",
      "Action RPG set in a vast open world with challenging combat and deep lore.",
      "Action-adventure game following Kratos and Atreus through the realms of Norse mythology.",
      "Space exploration RPG with hundreds of planets to discover and explore.",
      "Open-world adventure game with innovative gameplay mechanics and a vast world to explore.",
      "Epic wild west adventure with a compelling story and stunning open world.",
      "Massive open-world RPG with deep storytelling and challenging combat."
    ];
    const images = [
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=288&h=162&q=80",
      "https://images.unsplash.com/photo-1592155931584-901ac15763e3?auto=format&fit=crop&w=288&h=162&q=80",
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=288&h=162&q=80",
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=288&h=162&q=80",
      "https://images.unsplash.com/photo-1616872153334-9054deb40bd1?auto=format&fit=crop&w=384&h=216&q=80",
      "https://images.unsplash.com/photo-1472457897821-70d3819a0e24?auto=format&fit=crop&w=384&h=216&q=80",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=384&h=216&q=80"
    ];
    const ratings = [9.2, 9.8, 9.5, 8.7, 9.9, 9.7, 9.6];
    
    for (let i = 0; i < titles.length; i++) {
      const isTrending = i < 4; // First 4 are trending
      const isFeatured = i >= 4; // Last 3 are featured (top rated)
      
      this.createGame({
        title: titles[i],
        description: descriptions[i],
        genre: genres[i % genres.length],
        developer: developers[i],
        imageUrl: images[i],
        isTrending,
        isFeatured,
        releaseDate: new Date()
      }).then(game => {
        // Update rating directly to match the design
        this.updateGame(game.id, { rating: ratings[i] });
      });
    }
  }
}

// PostgreSQL Database Storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any to avoid typing issues

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(sql`${users.id} = ${id}`).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(sql`${users.username} = ${username}`).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(sql`${users.email} = ${email}`).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const now = new Date();
    const result = await db.insert(users).values({
      ...user,
      createdAt: now
    }).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(userData)
      .where(sql`${users.id} = ${id}`)
      .returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(sql`${users.id} = ${id}`);
    return result.rowCount > 0;
  }

  // Game operations
  async getGame(id: number): Promise<Game | undefined> {
    const result = await db.select().from(games).where(sql`${games.id} = ${id}`).limit(1);
    return result[0];
  }

  async getGameByTitle(title: string): Promise<Game | undefined> {
    const result = await db.select().from(games).where(sql`${games.title} = ${title}`).limit(1);
    return result[0];
  }

  async createGame(game: InsertGame): Promise<Game> {
    const now = new Date();
    const result = await db.insert(games).values({
      ...game,
      rating: 0,
      createdAt: now,
      updatedAt: now
    }).returning();
    return result[0];
  }

  async updateGame(id: number, gameData: Partial<Game>): Promise<Game | undefined> {
    const now = new Date();
    const result = await db.update(games)
      .set({
        ...gameData,
        updatedAt: now
      })
      .where(sql`${games.id} = ${id}`)
      .returning();
    return result[0];
  }

  async getAllGames(): Promise<Game[]> {
    return await db.select().from(games);
  }

  async getFeaturedGames(): Promise<Game[]> {
    return await db.select().from(games)
      .where(sql`${games.isFeatured} = true`)
      .orderBy(desc(games.rating));
  }

  async getTrendingGames(): Promise<Game[]> {
    return await db.select().from(games)
      .where(sql`${games.isTrending} = true`)
      .orderBy(desc(games.rating));
  }

  async getGamesByGenre(genre: string): Promise<Game[]> {
    return await db.select().from(games)
      .where(sql`${games.genre} = ${genre}`)
      .orderBy(desc(games.rating));
  }

  async deleteGame(id: number): Promise<boolean> {
    const result = await db.delete(games).where(sql`${games.id} = ${id}`);
    return result.rowCount > 0;
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    const result = await db.select().from(reviews).where(sql`${reviews.id} = ${id}`).limit(1);
    return result[0];
  }

  async createReview(review: InsertReview): Promise<Review> {
    const now = new Date();
    const result = await db.insert(reviews).values({
      ...review,
      createdAt: now
    }).returning();
    
    // Update game rating
    await this.updateGameRating(review.gameId);
    
    return result[0];
  }

  async updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined> {
    const result = await db.update(reviews)
      .set(reviewData)
      .where(sql`${reviews.id} = ${id}`)
      .returning();
    
    if (result[0] && (reviewData.rating || reviewData.isApproved !== undefined)) {
      await this.updateGameRating(result[0].gameId);
    }
    
    return result[0];
  }

  async getReviewsByGame(gameId: number): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(sql`${reviews.gameId} = ${gameId} AND ${reviews.isApproved} = true`)
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(sql`${reviews.userId} = ${userId}`)
      .orderBy(desc(reviews.createdAt));
  }

  async getPendingReviews(): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(sql`${reviews.isApproved} = false`)
      .orderBy(desc(reviews.createdAt));
  }

  async deleteReview(id: number): Promise<boolean> {
    const review = await this.getReview(id);
    if (!review) return false;
    
    const result = await db.delete(reviews).where(sql`${reviews.id} = ${id}`);
    if (result.rowCount > 0) {
      await this.updateGameRating(review.gameId);
      return true;
    }
    return false;
  }

  // Helper to update a game's rating based on its reviews
  private async updateGameRating(gameId: number): Promise<void> {
    const game = await this.getGame(gameId);
    if (!game) return;
    
    const gameReviews = await db.select()
      .from(reviews)
      .where(sql`${reviews.gameId} = ${gameId} AND ${reviews.isApproved} = true`);
    
    if (gameReviews.length === 0) {
      await this.updateGame(gameId, { rating: 0 });
      return;
    }
    
    const totalRating = gameReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = +(totalRating / gameReviews.length).toFixed(1);
    
    await this.updateGame(gameId, { rating: avgRating });
  }

  // Favorite operations
  async getFavorite(id: number): Promise<Favorite | undefined> {
    const result = await db.select().from(favorites).where(sql`${favorites.id} = ${id}`).limit(1);
    return result[0];
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const now = new Date();
    const result = await db.insert(favorites).values({
      ...favorite,
      createdAt: now
    }).returning();
    return result[0];
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites)
      .where(sql`${favorites.userId} = ${userId}`)
      .orderBy(desc(favorites.createdAt));
  }

  async deleteFavorite(id: number): Promise<boolean> {
    const result = await db.delete(favorites).where(sql`${favorites.id} = ${id}`);
    return result.rowCount > 0;
  }

  async isFavorite(userId: number, gameId: number): Promise<boolean> {
    const result = await db.select().from(favorites)
      .where(sql`${favorites.userId} = ${userId} AND ${favorites.gameId} = ${gameId}`)
      .limit(1);
    return result.length > 0;
  }

  // Activity log operations
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const now = new Date();
    const result = await db.insert(activityLogs).values({
      ...log,
      createdAt: now
    }).returning();
    return result[0];
  }

  async getRecentActivityLogs(limit: number): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  // Analytics operations
  async getAnalytics(days: number): Promise<Analytics[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return await db.select().from(analytics)
      .where(sql`${analytics.date} >= ${date}`)
      .orderBy(desc(analytics.date));
  }

  async updateDailyAnalytics(date: Date, data: Partial<Analytics>): Promise<Analytics> {
    // Format date to remove time component for comparison
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if we already have analytics for this date
    const existingAnalytics = await db.select().from(analytics)
      .where(sql`DATE(${analytics.date}) = DATE(${date})`)
      .limit(1);
    
    if (existingAnalytics.length > 0) {
      const existing = existingAnalytics[0];
      const updated = await db.update(analytics)
        .set({
          totalVisits: (existing.totalVisits || 0) + (data.totalVisits || 0),
          newUsers: (existing.newUsers || 0) + (data.newUsers || 0),
          activeUsers: (existing.activeUsers || 0) + (data.activeUsers || 0)
        })
        .where(sql`${analytics.id} = ${existing.id}`)
        .returning();
      return updated[0];
    } else {
      const now = new Date();
      const result = await db.insert(analytics).values({
        date,
        totalVisits: data.totalVisits || 0,
        newUsers: data.newUsers || 0,
        activeUsers: data.activeUsers || 0,
        createdAt: now
      }).returning();
      return result[0];
    }
  }

  // Reset and re-seed the database if needed
  private async resetDatabase(): Promise<void> {
    try {
      // Drop and recreate tables in proper order
      await db.delete(activityLogs);
      await db.delete(reviews);
      await db.delete(favorites);
      await db.delete(games);
      await db.delete(users);
      await db.delete(analytics);
      
      console.log("Database reset successfully");
    } catch (error) {
      console.error("Error resetting database:", error);
    }
  }
  
  // Seed initial games and admin user if needed
  async seedInitialData(): Promise<void> {
    // Check for possible password encryption issues with existing users
    const existingUsers = await this.getAllUsers();
    const passwordsNeedFixing = existingUsers.some(user => 
      !user.password.includes('.') || user.username === 'admin'
    );
    
    // Reset database if there are password issues
    if (passwordsNeedFixing && existingUsers.length > 0) {
      console.log("Detected password format issues - resetting database");
      await this.resetDatabase();
    }
    
    // Check if we have any users
    const users = await this.getAllUsers();
    if (users.length === 0) {
      try {
        // Import hashPassword function from auth 
        // Using dynamic import to avoid circular dependency
        const { hashPassword } = await import('./auth');
        
        // Create admin user with hashed password
        await this.createUser({
          username: "admin",
          password: await hashPassword("admin123"),
          email: "admin@topbestgames.com",
          fullName: "Administrator",
          isAdmin: true,
          avatar: "",
        });
      } catch (error) {
        // Fallback in case of circular dependency
        // Manual implementation of password hashing for initial admin
        const crypto = await import('crypto');
        const salt = crypto.randomBytes(16).toString("hex");
        const buf = await new Promise((resolve, reject) => {
          crypto.scrypt("admin123", salt, 64, (err, key) => {
            if (err) reject(err);
            else resolve(key);
          });
        });
        
        const hashedPassword = `${(buf as Buffer).toString("hex")}.${salt}`;
        
        await this.createUser({
          username: "admin",
          password: hashedPassword,
          email: "admin@topbestgames.com",
          fullName: "Administrator",
          isAdmin: true,
          avatar: "",
        });
      }
    }
    
    // Check if we have any games
    const games = await this.getAllGames();
    if (games.length === 0) {
      // Seed initial games
      const genres = ["action", "adventure", "rpg", "strategy", "simulation", "sports"];
      const titles = [
        "Cyberpunk 2077",
        "Elden Ring",
        "God of War: Ragnarök",
        "Starfield",
        "The Legend of Zelda: TOTK",
        "Red Dead Redemption 2",
        "The Witcher 3: Wild Hunt"
      ];
      const developers = [
        "CD Projekt Red",
        "FromSoftware",
        "Santa Monica Studio",
        "Bethesda Game Studios",
        "Nintendo",
        "Rockstar Games",
        "CD Projekt Red"
      ];
      const descriptions = [
        "Open-world RPG set in a dystopian future where body modification has become commonplace.",
        "Action RPG set in a vast open world with challenging combat and deep lore.",
        "Action-adventure game following Kratos and Atreus through the realms of Norse mythology.",
        "Space exploration RPG with hundreds of planets to discover and explore.",
        "Open-world adventure game with innovative gameplay mechanics and a vast world to explore.",
        "Epic wild west adventure with a compelling story and stunning open world.",
        "Massive open-world RPG with deep storytelling and challenging combat."
      ];
      const images = [
        "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=288&h=162&q=80",
        "https://images.unsplash.com/photo-1592155931584-901ac15763e3?auto=format&fit=crop&w=288&h=162&q=80",
        "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=288&h=162&q=80",
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=288&h=162&q=80",
        "https://images.unsplash.com/photo-1616872153334-9054deb40bd1?auto=format&fit=crop&w=384&h=216&q=80",
        "https://images.unsplash.com/photo-1472457897821-70d3819a0e24?auto=format&fit=crop&w=384&h=216&q=80",
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=384&h=216&q=80"
      ];
      const ratings = [9.2, 9.8, 9.5, 8.7, 9.9, 9.7, 9.6];
      
      for (let i = 0; i < titles.length; i++) {
        const isTrending = i < 4; // First 4 are trending
        const isFeatured = i >= 4; // Last 3 are featured (top rated)
        
        const game = await this.createGame({
          title: titles[i],
          description: descriptions[i],
          genre: genres[i % genres.length],
          developer: developers[i],
          imageUrl: images[i],
          isTrending,
          isFeatured,
          releaseDate: new Date()
        });
        
        // Update rating directly to match the design
        await this.updateGame(game.id, { rating: ratings[i] });
      }
    }
  }
}

// Use PostgreSQL storage for production
export const storage = new DatabaseStorage();
