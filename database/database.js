const sqlite3 = require('sqlite3').verbose();
const dbsetup = require('./setup');

dbsetup();

const db = new sqlite3.Database('./database.db');

function getAtivos(callback) {
  db.all('SELECT * FROM tipo_de_ativos', [], (err, rows) => {
    if (err) {
      return callback(err);
    }
    callback(null, rows);
  });
}

function getAllUsers(callback) {
  const query = `SELECT id, username, isAdmin FROM users`;
  db.all(query, [], (err, rows) => {
    if (err) {
      return callback(err, null);
    }
    return callback(null, rows);
  });
}

function addUser(username, name, email, hashedPassword, callback) {
  const query = `INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)`;
  db.run(query, [username, hashedPassword, name, email], function (err) {
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
  getAllUsers,
  getAtivos,
};
