const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./fiiData.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    }
});

async function fetchFiiData(fiiTicker) {
    const url = `https://investidor10.com.br/fiis/${fiiTicker}/`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const filteredData = { id: fiiTicker.toUpperCase() };

        $('#cards-ticker ._card').each(function() {
            const title = $(this).find('._card-header span').text().trim();
            const value = $(this).find('._card-body span').text().trim();
            filteredData[title] = value;
        });

        $('#table-indicators:nth-of-type(1) .cell').each(function() {
            const title = $(this).find('.name').text().trim();
            const value = $(this).find('.value span').text().trim();
            filteredData[title] = value;
        });

        filteredData.tipo      = $('#table-dividends-history tbody > tr:nth-of-type(1) td:nth-of-type(1)').text().trim();
        filteredData.datacom   = $('#table-dividends-history tbody > tr:nth-of-type(1) td:nth-of-type(2)').text().trim();
        filteredData.pagamento = $('#table-dividends-history tbody > tr:nth-of-type(1) td:nth-of-type(3)').text().trim();
        filteredData.valor     = $('#table-dividends-history tbody > tr:nth-of-type(1) td:nth-of-type(4)').text().trim();

        const dynamicColumns = Object.keys(filteredData).filter(key => key !== 'id').map(key => `${key.replace(/[^a-zA-Z0-9_]/g, '_')} TEXT`).join(', ');
        const createTableSql = `CREATE TABLE IF NOT EXISTS fii_data (id TEXT PRIMARY KEY, ${dynamicColumns})`;

        db.run(createTableSql, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Table created or already exists.');

                const placeholders = Object.keys(filteredData).map(() => '?').join(', ');
                const insertSql = `INSERT OR REPLACE INTO fii_data (${Object.keys(filteredData).map(key => key.replace(/[^a-zA-Z0-9_]/g, '_')).join(', ')}) VALUES (${placeholders})`;

                db.run(insertSql, Object.values(filteredData), function(err) {
                    if (err) {
                        console.error('Error inserting data:', err.message);
                    } else {
                        console.log('Data inserted or replaced successfully');
                    }
                });
            }
        });

        for (const key in filteredData) {
            if (filteredData.hasOwnProperty(key)) {
                console.log(`${key}: ${filteredData[key]}`);
            }
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

module.exports = { fetchFiiData };
