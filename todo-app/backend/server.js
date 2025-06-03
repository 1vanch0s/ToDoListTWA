const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ["https://1vanch0s.github.io", "https://web.telegram.org", "https://3ebd-2a0b-4140-b0d7-00-2.ngrok-free.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Тело запроса:", req.body);
  console.log("Заголовки:", req.headers);
  next();
});

// Обработчик для корневого пути
app.get("/", (req, res) => {
  console.log("Получен GET запрос на корень");
  res.status(200).json({ message: "API работает, используйте /log, /users или /tasks/sync с POST" });
});

// Обработчик для получения списка пользователей (для отладки)
app.get("/users", async (req, res) => {
  console.log("Получен GET запрос на /users");
  try {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении пользователей:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "todolist",
  password: "3003",
  port: 5432,
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        username TEXT,
        avatar_url TEXT
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        title TEXT NOT NULL,
        deadline TEXT,
        description TEXT,
        status TEXT,
        coins INTEGER,
        difficulty TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
    `);
    console.log("Таблицы users и tasks созданы");
  } catch (err) {
    console.error("Ошибка при создании таблиц:", err.message);
  }
};

initDb();

app.post("/log", (req, res) => {
  const { message } = req.body;
  console.log(`[Фронтенд-лог] ${new Date().toISOString()}: ${message}`);
  res.status(200).json({ status: "Log received" });
});

app.post("/users", async (req, res) => {
  const { userId, username, avatarUrl } = req.body;
  if (!userId || !username) {
    console.log("Ошибка: userId или username отсутствуют", { userId, username });
    return res.status(400).json({ error: "userId и username обязательны" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (user_id, username, avatar_url) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO NOTHING RETURNING *",
      [userId, username, avatarUrl]
    );
    console.log("Пользователь зарегистрирован на сервере:", result.rows[0] || { userId, username, avatarUrl });
    res.status(201).json(result.rows[0] || { userId, username, avatarUrl });
  } catch (err) {
    console.error("Ошибка при регистрации пользователя на сервере:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/tasks/sync", async (req, res) => {
  const { userId, tasks } = req.body;
  if (!userId || !tasks) {
    console.log("Ошибка: userId или tasks отсутствуют", { userId, tasks });
    return res.status(400).json({ error: "userId и tasks обязательны" });
  }

  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    await client.query("DELETE FROM tasks WHERE user_id = $1", [userId]);

    const insertPromises = tasks.map((task) =>
      client.query(
        "INSERT INTO tasks (user_id, task_id, title, deadline, description, status, coins, difficulty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          userId,
          task.id,
          task.title,
          task.deadline,
          task.description,
          task.status,
          task.coins,
          task.difficulty,
        ]
      )
    );
    await Promise.all(insertPromises);

    await client.query("COMMIT");
    client.release();
    console.log(`Задачи синхронизированы для userId ${userId}`);
    res.status(200).json({ message: "Tasks synced successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    client.release();
    console.error("Ошибка при синхронизации задач:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});