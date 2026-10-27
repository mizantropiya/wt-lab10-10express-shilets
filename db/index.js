const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL не задан. Маршруты PostgreSQL будут возвращать ошибку до настройки подключения.");
}

const useSsl = Boolean(
  connectionString &&
  (connectionString.includes("render.com") || process.env.PGSSLMODE === "require")
);

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});

module.exports = pool;
