const sqlite3 = require('sqlite3').verbose();

function dbsetup() {
  const db = new sqlite3.Database('./database.db');

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      isAdmin INTEGER DEFAULT 0
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table created or already exists.');
      }
      
      db.all(`PRAGMA table_info(users)`, (err, columns) => {
        if (err) {
          console.error('Error checking users table schema:', err.message);
          return;
        }

        const hasIsAdmin = columns.some(column => column.name === 'isAdmin');
        if (!hasIsAdmin) {
          db.run(`ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0`, (err) => {
            if (err) {
              console.error('Error adding isAdmin column:', err.message);
            } else {
              console.log('isAdmin column added to users table.');
            }

            db.close((err) => {
              if (err) {
                console.error('Error closing the database:', err.message);
              } else {
                console.log('Database setup complete and connection closed.');
              }
            });
          });
        } else {
          console.log('isAdmin column already exists.');

          db.close((err) => {
            if (err) {
              console.error('Error closing the database:', err.message);
            } else {
              console.log('Database setup complete and connection closed.');
            }
          });
        }
      });
    });
  });
}

module.exports = dbsetup;
