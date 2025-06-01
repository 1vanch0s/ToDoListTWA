const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

// Настройка middleware
app.use(cors());
app.use(express.json()); // Парсинг JSON

// Отладочный middleware для проверки тела запроса
app.use((req, res, next) => {
  console.log('Получено тело запроса:', req.body);
  next();
});

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.stack);
    process.exit(1);
  }
  console.log('Подключено к базе данных PostgreSQL');
});

// Создание таблиц
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(user_id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty VARCHAR(20),
        deadline TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        coins INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stats (
        user_id VARCHAR(50) PRIMARY KEY REFERENCES users(user_id),
        completed_easy INTEGER DEFAULT 0,
        completed_medium INTEGER DEFAULT 0,
        completed_hard INTEGER DEFAULT 0,
        failed_easy INTEGER DEFAULT 0,
        failed_medium INTEGER DEFAULT 0,
        failed_hard INTEGER DEFAULT 0,
        total_coins INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        total_earned_coins INTEGER DEFAULT 0,
        total_earned_xp INTEGER DEFAULT 0,
        purchases INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(user_id),
        title VARCHAR(255) NOT NULL,
        cost INTEGER NOT NULL,
        purchased BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Таблицы созданы или уже существуют');
  } catch (err) {
    console.error('Ошибка при создании таблиц:', err.stack);
    process.exit(1);
  }
};

initDb();

// Эндпоинты для пользователей
app.post('/users', async (req, res) => {
  const { userId, username } = req.body || {};
  if (!userId || !username) {
    return res.status(400).json({ error: 'userId и username обязательны' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO users (user_id, username) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET username = $2 RETURNING *',
      [userId, username]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинты для задач
app.get('/tasks', async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tasks', async (req, res) => {
  const { userId, title, description, difficulty, deadline, status, coins } = req.body;
  if (!userId || !title) {
    return res.status(400).json({ error: 'userId и title обязательны' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, difficulty, deadline, status, coins) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, title, description, difficulty, deadline, status, coins]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, difficulty, deadline, status, coins } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, difficulty = $3, deadline = $4, status = $5, coins = $6 WHERE id = $7 RETURNING *',
      [title, description, difficulty, deadline, status, coins, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинты для статистики
app.get('/stats/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM stats WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      const newStats = await pool.query(
        'INSERT INTO stats (user_id) VALUES ($1) RETURNING *',
        [userId]
      );
      return res.json(newStats.rows[0]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/stats/:userId', async (req, res) => {
  const { userId } = req.params;
  const { completed_easy, completed_medium, completed_hard, failed_easy, failed_medium, failed_hard, total_coins, xp, level, total_earned_coins, total_earned_xp, purchases } = req.body;
  try {
    const result = await pool.query(
      'UPDATE stats SET completed_easy = $1, completed_medium = $2, completed_hard = $3, failed_easy = $4, failed_medium = $5, failed_hard = $6, total_coins = $7, xp = $8, level = $9, total_earned_coins = $10, total_earned_xp = $11, purchases = $12 WHERE user_id = $13 RETURNING *',
      [completed_easy, completed_medium, completed_hard, failed_easy, failed_medium, failed_hard, total_coins, xp, level, total_earned_coins, total_earned_xp, purchases, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Статистика не найдена' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинты для наград
app.get('/rewards', async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await pool.query('SELECT * FROM rewards WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/rewards', async (req, res) => {
  const { userId, title, cost, purchased } = req.body;
  if (!userId || !title || cost === undefined) {
    return res.status(400).json({ error: 'userId, title и cost обязательны' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO rewards (user_id, title, cost, purchased) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, cost, purchased]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/rewards/:id', async (req, res) => {
  const { id } = req.params;
  const { title, cost, purchased } = req.body;
  try {
    const result = await pool.query(
      'UPDATE rewards SET title = $1, cost = $2, purchased = $3 WHERE id = $4 RETURNING *',
      [title, cost, purchased, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Награда не найдена' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/rewards/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM rewards WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Награда не найдена' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});