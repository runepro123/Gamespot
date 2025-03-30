import { 
  users, type User, type InsertUser,
  games, type Game, type InsertGame,
  reviews, type Review, type InsertReview,
  favorites, type Favorite, type InsertFavorite,
  activityLogs, type ActivityLog, type InsertActivityLog,
  analytics, type Analytics
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

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
  sessionStore: session.SessionStore;
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
  
  sessionStore: session.SessionStore;

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

export const storage = new MemStorage();
