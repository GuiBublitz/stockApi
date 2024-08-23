const { fetchFiiData } = require('./fiiScraper');
const sqlite3 = require('sqlite3').verbose();

const express = require('express');
const app = express();
const port = 3000;

const fiiData = {
  BCF11: {
    name: "BCF11 - Fundo Imobiliário",
    value: "R$ 100,00",
    lastYield: "R$ 0,75",
  },
};

function validateUserKey(req, res, next) {
  const userKey = req.query.userKey;
  const validUserKey = "secret-key-notrly";

  if (userKey !== validUserKey) {
    return res.status(403).json({ error: "Invalid user key" });
  }
  next();
}

app.get('/api/getFiiData/:id', validateUserKey, async (req, res) => {
    const fiiTicker = req.params.id.toLowerCase();
  
    try {
      await fetchFiiData(fiiTicker);
  
      const db = new sqlite3.Database('./fiiData.db');
      db.get('SELECT * FROM fii_data WHERE id = ?', [fiiTicker.toUpperCase()], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
  
        if (!row) {
          return res.status(404).json({ error: "FII not found" });
        }
  
        res.status(200).json(row);
      });
  
      db.close();
    } catch (error) {
      res.status(500).json({ error: 'Error fetching data', details: error.message });
    }
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
