const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const POSITION_ORDER = {
  GK: 1,
  CB: 2,
  LB: 3,
  RB: 4,
  RWB: 5,
  LWB: 6,
  CDM: 7,
  CM: 8,
  CAM: 9,
  RM: 10,
  LM: 11,
  RW: 12,
  LW: 13,
  CF: 14,
  ST: 15,
};

function sortPlayers(players) {
  return players.sort((a, b) => {
    const posA = POSITION_ORDER[a.positions[0]] || 999;
    const posB = POSITION_ORDER[b.positions[0]] || 999;

    if (posA !== posB) {
      return posA - posB;
    }

    return a.name.localeCompare(b.name);
  });
}

app.get('/api/teams', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM teams ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const {
  name,
  primary_color,
  secondary_color
} = req.body;

const result = await pool.query(
  `INSERT INTO teams
  (name, primary_color, secondary_color)
  VALUES($1, $2, $3)
  RETURNING *`,
  [
    name,
    primary_color,
    secondary_color
  ]
);

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM teams WHERE id = $1',
      [req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/teams/:id/players', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM players WHERE team_id = $1',
      [req.params.id]
    );

    const sorted = sortPlayers(result.rows);

    res.json(sorted);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/teams/:id/players', async (req, res) => {
  try {
    const { name, positions, age, club, zone } = req.body;

    const result = await pool.query(
      `INSERT INTO players
      (team_id, name, positions, age, club, zone)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        req.params.id,
        name,
        positions,
        age || null,
        club || null,
        zone
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/players/:id/zone', async (req, res) => {
  try {
    const { zone } = req.body;

    await pool.query(
      'UPDATE players SET zone = $1 WHERE id = $2',
      [zone, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/players/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM players WHERE id = $1',
      [req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});