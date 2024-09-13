const sqlite3 = require('sqlite3').verbose();
const { fetchFiiData } = require('./fiiScraper');

async function getFiiData(req, res) {
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

      res.status(200).json(JSON.parse(row.data));
    });

    db.close();
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
}

module.exports = { getFiiData };
