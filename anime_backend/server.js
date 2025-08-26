// anime_backend/server.js  (ESM)
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();

// mysql2/promise createPool is sync; connections are opened lazily
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
});

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});
app.get('/metrics/top', async (_req, res) => {
  try {
    // NOTE: table has no timestamps; order only by count
    const sql = `
      SELECT search_term, count, poster_url, anime_id
      FROM search_metrics
      ORDER BY count DESC
      LIMIT 20
    `;
    const [rows] = await pool.query(sql);
    res.json({ ok: true, data: rows });
  } catch (e) {
    console.error('GET /metrics/top failed:', e);
    res.status(500).json({ ok: false, error: e.message, code: e.code });
  }
});

app.post('/metrics/increment', async (req, res) => {
  try {
    const { searchTerm, anime_id, poster_url } = req.body || {};
    if (!searchTerm) return res.status(400).json({ error: 'searchTerm required' });

    const sql = `
      INSERT INTO search_metrics (anime_id, search_term, count, poster_url)
      VALUES (?, ?, 1, ?)
      ON DUPLICATE KEY UPDATE
        count = count + 1,
        poster_url = COALESCE(VALUES(poster_url), poster_url),
        search_term = COALESCE(VALUES(search_term), search_term)
    `;
    const params = [Number.isFinite(anime_id) ? anime_id : null, searchTerm.trim(), poster_url || ''];
    await pool.execute(sql, params);

    res.json({ ok: true });
  } catch (e) {
    console.error('increment error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));