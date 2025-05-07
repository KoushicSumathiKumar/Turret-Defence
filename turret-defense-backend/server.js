const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Set up the SQLite database
const db = new sqlite3.Database('./turret-defense.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Middleware for parsing JSON requests
app.use(express.json());

// CORS 
app.use(cors({
    origin: 'http://localhost:5173'
}));

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Create the Leaderboard table (if it doesn't already exist)
db.run(`CREATE TABLE IF NOT EXISTS Leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  wave INTEGER NOT NULL,
  enemies_defeated INTEGER NOT NULL,
  turret TEXT NOT NULL,
  date_time TEXT NOT NULL
)`);

// Endpoint to get leaderboard data
app.get('/api/leaderboard', (req, res) => {
  db.all("SELECT * FROM Leaderboard ORDER BY wave DESC, enemies_defeated DESC, date_time ASC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ leaderboard: rows });
  });
});

// Endpoint to add a new leaderboard entry
app.post('/api/leaderboard', (req, res) => {
  console.log('Received POST body:', req.body);
  const { username, difficulty, wave, enemies_defeated, turretType, date_time} = req.body;

  // Validate input data
  if (
    username == null || 
    difficulty == null || 
    wave == null || 
    enemies_defeated == null || 
    turretType == null || 
    date_time == null
  ) {
    return res.status(400).json({ error: 'Missing or invalid value' });
  }
  

  const query = 'INSERT INTO Leaderboard (username, difficulty, wave, enemies_defeated, turret, date_time) VALUES (?, ?, ?, ?, ?, ?)';
  console.log('Values to insert:', username, difficulty, wave, enemies_defeated, turretType, date_time);
  db.run(query, [username, difficulty, wave, enemies_defeated, turretType, date_time], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, username, wave, enemies_defeated, date_time });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
