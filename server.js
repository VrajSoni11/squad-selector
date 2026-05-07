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

