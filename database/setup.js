const sqlite3 = require('sqlite3').verbose();

function dbsetup() {
  const db = new sqlite3.Database('./database.db');

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      isAdmin INTEGER DEFAULT 0,
      email TEXT,
      name TEXT
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
      });
    });

    db.run(`CREATE TABLE IF NOT EXISTS tipo_de_ativos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating tipo_de_ativos table:', err.message);
      } else {
        console.log('tipo_de_ativos table created or already exists.');

        const tiposDeAtivos = [
          { name: 'Ações', description: 'Investimentos em ações de empresas públicas.' },
          { name: 'Fundos de Investimentos', description: 'Fundos de investimento focados em diversos ativos.' },
          { name: 'FIIs', description: 'Fundos de investimento imobiliário.' },
          { name: 'Criptomoedas', description: 'Moedas digitais descentralizadas, como Bitcoin.' },
          { name: 'Stock', description: 'Ações de empresas internacionais.' },
          { name: 'Reit', description: 'Real Estate Investment Trust, fundos de investimento em imóveis.' },
          { name: 'BDRs', description: 'Brazilian Depositary Receipts, representações de ações de empresas estrangeiras.' },
          { name: 'ETFs', description: 'Exchange-Traded Funds, fundos que replicam índices.' },
          { name: 'ETFs Internacionais', description: 'ETFs que replicam índices internacionais.' },
          { name: 'Tesouro Direto', description: 'Títulos públicos emitidos pelo governo.' },
          { name: 'Renda Fixa', description: 'Investimentos em títulos de renda fixa, como CDBs e debêntures.' },
          { name: 'Outros', description: 'Outros tipos de ativos financeiros.' }
        ];

        db.serialize(() => {
          tiposDeAtivos.forEach((ativo) => {
            db.run(`INSERT OR IGNORE INTO tipo_de_ativos (name, description) VALUES (?, ?)`, [ativo.name, ativo.description], (err) => {
              if (err) {
                console.error(`Error inserting ${ativo.name} into tipo_de_ativos:`, err.message);
              } else {
                console.log(`${ativo.name} inserted into tipo_de_ativos.`);
              }
            });
          });

          db.close((err) => {
            if (err) {
              console.error('Error closing the database:', err.message);
            } else {
              console.log('Database setup complete and connection closed.');
            }
          });
        });
      }
    });
  });
}

module.exports = dbsetup;
