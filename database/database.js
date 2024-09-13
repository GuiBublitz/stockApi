const sqlite3 = require('sqlite3').verbose();
const dbsetup = require('./setup');

dbsetup();

const db = new sqlite3.Database('./database.db');

function addUser(username, hashedPassword, callback) {
  const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
  db.run(query, [username, hashedPassword], function (err) {
    if (err) {
      console.error('Error inserting user:', err.message);
      callback(err, null);
    } else {
      console.log(`User added with ID: ${this.lastID}`);
      callback(null, this.lastID);
    }
  });
}

function getUserByUsername(username, callback) {
  const query = `SELECT * FROM users WHERE username = ?`;
  db.get(query, [username], (err, row) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      callback(err, null);
    } else {
      callback(null, row);
    }
  });
}

function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
}

module.exports = {
  addUser,
  getUserByUsername,
  closeDatabase,
};
