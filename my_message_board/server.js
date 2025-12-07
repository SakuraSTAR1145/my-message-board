const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function initDB() {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at BIGINT
    )
  `);
  console.log('✅ 数据库就绪');
}
app.get('/api/messages', async (req, res) => {
  const result = await client.query('SELECT * FROM messages ORDER BY created_at DESC');
  res.json(result.rows);
});
app.post('/api/messages', async (req, res) => {
  const { author, content } = req.body;
  const timestamp = Date.now();
  const result = await client.query(
    'INSERT INTO messages (author, content, created_at) VALUES ($1, $2, $3) RETURNING *',
    [author, content, timestamp]
  );
  res.status(201).json(result.rows[0]);
});
app.get('/health', (req, res) => res.json({ status: 'OK', database: 'connected' }));
app.listen(PORT, async () => {
  console.log(`🚀 后端运行端口: ${PORT}`);
  await initDB();
});