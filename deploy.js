// deploy.js - Prepares the app for deployment to Netlify
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function deploy() {
  console.log('Preparing for Netlify deployment...');

  // Make sure scripts directory exists
  if (!fs.existsSync('./scripts')) {
    fs.mkdirSync('./scripts');
  }

  // Make sure netlify directory exists
  if (!fs.existsSync('./netlify')) {
    fs.mkdirSync('./netlify');
  }

  // Make sure netlify/functions directory exists
  if (!fs.existsSync('./netlify/functions')) {
    fs.mkdirSync('./netlify/functions', { recursive: true });
  }

  // Create build-netlify.js if it doesn't exist
  const buildNetlifyPath = './scripts/build-netlify.js';
  if (!fs.existsSync(buildNetlifyPath)) {
    fs.writeFileSync(buildNetlifyPath, `
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runBuild() {
  console.log('Starting Netlify build process...');
  
  // Run the normal build process
  await new Promise((resolve, reject) => {
    console.log('Building React app...');
    exec('npm run build', (error, stdout, stderr) => {
      if (error) {
        console.error('Error building React app:', error);
        return reject(error);
      }
      console.log(stdout);
      console.error(stderr);
      resolve();
    });
  });

  // Copy server files to netlify/functions
  await new Promise((resolve, reject) => {
    console.log('Setting up Netlify function...');
    exec('node scripts/copy-netlify-files.js', (error, stdout, stderr) => {
      if (error) {
        console.error('Error setting up Netlify function:', error);
        return reject(error);
      }
      console.log(stdout);
      console.error(stderr);
      resolve();
    });
  });

  console.log('Netlify build completed!');
}

runBuild().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
    `);
  }

  // Create copy-netlify-files.js if it doesn't exist
  const copyNetlifyFilesPath = './scripts/copy-netlify-files.js';
  if (!fs.existsSync(copyNetlifyFilesPath)) {
    fs.writeFileSync(copyNetlifyFilesPath, `
const fs = require('fs');
const path = require('path');

// Create the Netlify functions directory if it doesn't exist
const functionDir = './netlify/functions';
if (!fs.existsSync(functionDir)) {
  fs.mkdirSync(functionDir, { recursive: true });
}

// Copy API function to netlify/functions
const apiFunctionPath = path.join(functionDir, 'api.js');
fs.writeFileSync(apiFunctionPath, \`
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Pool } = require('pg');
const crypto = require('crypto');
const connectPgSimple = require('connect-pg-simple');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.SITE_URL || true,
  credentials: true
}));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
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
  secret: process.env.SESSION_SECRET || 'topbestgames-secret-key-' + Math.random().toString(36).substring(2),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Utility functions for password handling
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(\`\${derivedKey.toString('hex')}.\${salt}\`);
    });
  });
}

async function verifyPassword(password, hash) {
  try {
    const [hashedPassword, salt] = hash.split('.');
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(crypto.timingSafeEqual(
          Buffer.from(hashedPassword, 'hex'),
          derivedKey
        ));
      });
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

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

// Auth routes
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
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Authentication failed' });
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

// Game routes
app.get('/api/games', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ message: 'Error fetching games' });
  }
});

// Add more routes here...

// Export the serverless function
export const handler = serverless(app, {
  basePath: '/.netlify/functions/api'
});
\`);

console.log('API function copied to netlify/functions/api.js');

// Create Netlify redirects file if it doesn't exist
const redirectsPath = './public/_redirects';
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync(redirectsPath, \`
# Netlify redirects
/api/*  /.netlify/functions/api/:splat  200
/*      /index.html                     200
\`);

console.log('Created _redirects file in public directory');
});
    `);
  }

  // Create netlify.toml if it doesn't exist
  const netlifyTomlPath = './netlify.toml';
  if (!fs.existsSync(netlifyTomlPath)) {
    fs.writeFileSync(netlifyTomlPath, `
[build]
  command = "node scripts/build-netlify.js"
  publish = "dist/public"
  functions = "netlify/functions"

[dev]
  command = "npm run dev"
  port = 3000
  publish = "public"
  autoLaunch = true

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
    `);
  }

  // Create prebuild.js if it doesn't exist
  const prebuildPath = './prebuild.js';
  if (!fs.existsSync(prebuildPath)) {
    fs.writeFileSync(prebuildPath, `
// prebuild.js - Script that runs before the build process
const fs = require('fs');
const path = require('path');

// Ensure necessary directories exist
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

if (!fs.existsSync('./netlify/functions')) {
  fs.mkdirSync('./netlify/functions', { recursive: true });
}

// Create _redirects file for proper SPA routing
const redirectsPath = './public/_redirects';
fs.writeFileSync(redirectsPath, \`
# Netlify redirects
/api/*  /.netlify/functions/api/:splat  200
/*      /index.html                     200
\`);

console.log('Created _redirects file for Netlify deployment');
    `);
  }

  // Create the _redirects file
  const redirectsDir = './public';
  if (!fs.existsSync(redirectsDir)) {
    fs.mkdirSync(redirectsDir, { recursive: true });
  }
  
  fs.writeFileSync('./public/_redirects', `
# Netlify redirects
/api/*  /.netlify/functions/api/:splat  200
/*      /index.html                     200
  `);

  console.log('Deployment preparation completed');
  console.log('Files required for deployment have been created');
  
  console.log('\nTo deploy to Netlify:');
  console.log('1. Connect this repository to your Netlify account');
  console.log('2. Configure build settings as specified in netlify.toml');
  console.log('3. Add environment variables for your database connection');
}

deploy().catch(err => {
  console.error('Deployment preparation failed:', err);
  process.exit(1);
});