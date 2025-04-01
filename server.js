// server.js - Entry point for Render.com web service (API-only version)
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cors from 'cors';
import { createServer } from 'http';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
const { Pool } = pg;
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import crypto from 'crypto';

// For ES Module support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  // Allow all origins in development, specific origin in production
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || true  // Change to your frontend URL in production
    : true,
  credentials: true
}));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Session configuration
const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  pool,
  tableName: 'session',
  createTableIfMissing: true
});

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'topbestgames-secret-key-' + Math.random().toString(36).substring(2, 15),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Passport authentication setup
app.use(passport.initialize());
app.use(passport.session());

// Utility functions for password handling
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${derivedKey.toString('hex')}.${salt}`);
    });
  });
}

async function verifyPassword(password, hash) {
  try {
    // Check if stored password is in the expected format
    if (!hash || !hash.includes('.')) {
      return false;
    }
    
    const [hashedPassword, salt] = hash.split('.');
    if (!hashedPassword || !salt) {
      return false;
    }
    
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        try {
          resolve(crypto.timingSafeEqual(
            Buffer.from(hashedPassword, 'hex'),
            derivedKey
          ));
        } catch (error) {
          console.error('Error during password comparison:', error);
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

// AUTHENTICATION ENDPOINTS
// ======================

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, fullName } = req.body;
    
    // Check if username exists
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Check if email exists
    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (username, password, email, "fullName", "isAdmin", avatar, "createdAt", "isActive") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [username, hashedPassword, email, fullName || username, false, '', new Date(), true]
    );
    
    const newUser = result.rows[0];
    delete newUser.password; // Don't return password
    
    // Log user in
    req.login(newUser, err => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }
      return res.status(201).json(newUser);
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info && info.message ? info.message : 'Authentication failed' });
    }
    req.login(user, err => {
      if (err) {
        return next(err);
      }
      // Don't return the password
      const userResponse = { ...user };
      delete userResponse.password;
      
      return res.json(userResponse);
    });
  })(req, res, next);
});

app.post('/api/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      return res.status(500).json({ message: 'Error during logout' });
    }
    res.json({ message: 'Successfully logged out' });
  });
});

app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Don't return the password
  const userResponse = { ...req.user };
  delete userResponse.password;
  
  res.json(userResponse);
});

// GAME ENDPOINTS
// =============

app.get('/api/games', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ message: 'Error fetching games' });
  }
});

// Special routes must come before generic ones
app.get('/api/games/trending', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games ORDER BY rating DESC LIMIT 10');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trending games:', error);
    res.status(500).json({ message: 'Error fetching trending games' });
  }
});

app.get('/api/games/featured', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games WHERE "isFeatured" = true');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured games:', error);
    res.status(500).json({ message: 'Error fetching featured games' });
  }
});

app.get('/api/games/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const result = await pool.query('SELECT * FROM games WHERE genre = $1', [genre]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching games by genre:', error);
    res.status(500).json({ message: 'Error fetching games by genre' });
  }
});

// Generic game by ID route comes after specific routes
app.get('/api/games/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM games WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ message: 'Error fetching game' });
  }
});

// REVIEW ENDPOINTS
// ==============

app.get('/api/games/:id/reviews', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM reviews WHERE "gameId" = $1 AND "isApproved" = true', [gameId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

app.post('/api/reviews', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'You must be logged in to post a review' });
  }
  
  try {
    const { gameId, rating, content } = req.body;
    const userId = req.user.id;
    
    // Validate inputs
    if (!gameId || !rating || !content) {
      return res.status(400).json({ message: 'GameId, rating, and content are required' });
    }
    
    // Check if game exists
    const gameCheck = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (gameCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Create review
    const result = await pool.query(
      'INSERT INTO reviews ("userId", "gameId", rating, content, "createdAt", "isApproved") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, gameId, rating, content, new Date(), false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
});

// Add additional API endpoints as needed for your game database server
// ...

// HEALTH CHECK ENDPOINTS
// ===================

app.get('/', (req, res) => {
  res.status(200).send('TopBestGames API Server is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API Server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: process.env.NODE_ENV === 'production' ? undefined : err.message 
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = createServer(app);

// Explicitly bind to all network interfaces (0.0.0.0) for Render.com compatibility
server.listen(PORT, '0.0.0.0', () => {
  console.log(`API Server listening on port ${PORT}`);
  console.log(`Server is bound to all network interfaces (0.0.0.0)`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Setup passport for authentication
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0] || null);
  } catch (error) {
    done(error);
  }
});