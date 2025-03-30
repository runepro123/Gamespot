import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  avatar: text("avatar_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Game genres enum
export const genreEnum = pgEnum("genre", [
  "action", 
  "adventure", 
  "rpg", 
  "strategy", 
  "simulation",
  "sports", 
  "racing", 
  "puzzle", 
  "shooter", 
  "fighting",
  "platformer",
  "survival",
  "horror",
  "other"
]);

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  genre: genreEnum("genre").notNull(),
  developer: text("developer").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: real("rating").default(0),
  releaseDate: timestamp("release_date"),
  isFeatured: boolean("is_featured").default(false),
  isTrending: boolean("is_trending").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  gameId: integer("game_id").notNull(),
  userId: integer("user_id").notNull(),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Favorites table (for users to save favorite games)
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameId: integer("game_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity logs for admin panel
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  userId: integer("user_id"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Analytics data (daily/monthly stats)
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  totalVisits: integer("total_visits").default(0),
  newUsers: integer("new_users").default(0),
  activeUsers: integer("active_users").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  avatar: true,
  isAdmin: true,
}).extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export const insertGameSchema = createInsertSchema(games).pick({
  title: true,
  description: true,
  genre: true,
  developer: true,
  imageUrl: true,
  isFeatured: true,
  isTrending: true,
  releaseDate: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  content: true,
  rating: true,
  gameId: true,
  userId: true,
  isApproved: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  gameId: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  action: true,
  userId: true,
  details: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

export type Analytics = typeof analytics.$inferSelect;
