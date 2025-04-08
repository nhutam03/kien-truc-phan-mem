const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 80;

const pool = new Pool({
    user: 'postgres',
    host: process.env.DB_HOST || 'db',
    database: 'votes',
    password: 'postgres',
    port: 5432,
});

app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT vote, COUNT(*) as count FROM votes GROUP BY vote');
        const votes = result.rows.reduce((acc, row) => {
            acc[row.vote] = parseInt(row.count);
            return acc;
        }, {});
        res.send(`
      <h1>Voting Results</h1>
      <p>Cats: ${votes['Cats'] || 0}</p>
      <p>Dogs: ${votes['Dogs'] || 0}</p>
      <a href="/">Back to voting</a>
    `);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving results');
    }
});

app.listen(port, () => {
    console.log(`Result app running on port ${port}`);
});