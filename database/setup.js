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

        const addColumnIfNotExists = (columnName, columnType, defaultValue) => {
          const columnExists = columns.some(column => column.name === columnName);
          if (!columnExists) {
            const addColumnQuery = `ALTER TABLE users ADD COLUMN ${columnName} ${columnType}${defaultValue ? ' DEFAULT ' + defaultValue : ''}`;
            db.run(addColumnQuery, (err) => {
              if (err) {
                console.error(`Error adding ${columnName} column:`, err.message);
              } else {
                console.log(`${columnName} column added to users table.`);
              }
            });
          } else {
            console.log(`${columnName} column already exists.`);
          }
        };

        addColumnIfNotExists('isAdmin', 'INTEGER', 0);
        addColumnIfNotExists('email', 'TEXT', null);
        addColumnIfNotExists('name', 'TEXT', null);

        db.close((err) => {
          if (err) {
            console.error('Error closing the database:', err.message);
          } else {
            console.log('Database setup complete and connection closed.');
          }
        });
      });
    });
  });
}

module.exports = dbsetup;
