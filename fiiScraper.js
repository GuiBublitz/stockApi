const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./fiiData.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    }
});

function standardizeKey(key, fiiTicker) {
    const tickerPrefix = `${fiiTicker} `;
    if (key.startsWith(tickerPrefix)) {
        return key.substring(tickerPrefix.length);
    }
    return key;
}

async function fetchFiiData(fiiTicker) {
    const url = `https://investidor10.com.br/fiis/${fiiTicker}/`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const filteredData = { id: fiiTicker.toUpperCase() };

        $('#cards-ticker ._card').each(function() {
            const title = $(this).find('._card-header span').text().trim();
            const value = $(this).find('._card-body span').text().trim();
            filteredData[standardizeKey(title, fiiTicker)] = value;
        });

        $('#table-indicators:nth-of-type(1) .cell').each(function() {
            const title = $(this).find('.name').text().trim();
            const value = $(this).find('.value span').text().trim();
            filteredData[standardizeKey(title, fiiTicker)] = value;
        });

        filteredData.tipo      = $('#table-dividends-history tbody > tr:nth-of-type(1) td:nth-of-type(1)').text().trim();
        filteredData.datacom   = $('#table-dividends-history tbody > tr:nth-of-type(1) td:nth-of-type(2)').text().trim();
        filteredData.pagamento = $('#table-dividends-history tbody > tr:nth-of-type(1) td:nth-of-type(3)').text().trim();
        filteredData.valor     = $('#table-dividends-history tbody > tr:nth-of-type(1) td:nth-of-type(4)').text().trim();

        const jsonData = JSON.stringify(filteredData);

        const createTableSql = `CREATE TABLE IF NOT EXISTS fii_data (id TEXT PRIMARY KEY, data TEXT)`;
        await runQuery(createTableSql);

        console.log('Table created or already exists.');

        const insertSql = `INSERT OR REPLACE INTO fii_data (id, data) VALUES (?, ?)`;
        await runQuery(insertSql, [fiiTicker.toUpperCase(), jsonData]);

        console.log('Data inserted or replaced successfully');

        console.log(jsonData);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

module.exports = { fetchFiiData };
