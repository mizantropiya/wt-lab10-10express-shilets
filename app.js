const express = require("express");
const pool = require("./db");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateProduct(body) {
  const { name, category, price, isAvailable } = body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof category !== "string" || !category.trim() ||
    price === undefined || Number.isNaN(Number(price)) || Number(price) < 0 ||
    typeof isAvailable !== "boolean"
  ) {
    return "Некорректные данные товара";
  }

  return null;
}

app.get("/", (req, res) => {
  res.send("Express работает!");
});

app.get("/api/info", (req, res) => {
  res.json({
    application: "WT-10 Express PostgreSQL API",
    technology: "Node.js + Express",
    database: "PostgreSQL"
  });
});

app.post("/api/test", (req, res) => {
  res.json({
    message: "Данные получены",
    data: req.body
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");
    res.json(result.rows[0]);
  } catch (error) {
    console.error("DB test error:", error.message);
    res.status(500).json({ error: "Ошибка подключения к базе данных" });
  }
});

app.get("/api/products/search", async (req, res) => {
  try {
    const name = String(req.query.name || "").trim();
    const result = await pool.query(
      `SELECT "Id", "Name", "Category", "Price", "IsAvailable", "CreatedAt", "Description"
       FROM "Products"
       WHERE "Name" ILIKE $1
       ORDER BY "Id"`,
      [`%${name}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Ошибка поиска" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT "Id", "Name", "Category", "Price", "IsAvailable", "CreatedAt", "Description"
       FROM "Products"
       ORDER BY "Id"`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET products error:", error.message);
    res.status(500).json({ error: "Ошибка получения товаров" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный идентификатор" });
    }

    const result = await pool.query(
      `SELECT "Id", "Name", "Category", "Price", "IsAvailable", "CreatedAt", "Description"
       FROM "Products"
       WHERE "Id" = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("GET product error:", error.message);
    res.status(500).json({ error: "Ошибка получения товара" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const validationError = validateProduct(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const {
      name,
      category,
      price,
      isAvailable,
      description = ""
    } = req.body;

    const result = await pool.query(
      `INSERT INTO "Products"
         ("Name", "Category", "Price", "IsAvailable", "Description")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), category.trim(), Number(price), isAvailable, String(description).trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST product error:", error.message);
    res.status(500).json({ error: "Ошибка создания товара" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный идентификатор" });
    }

    const validationError = validateProduct(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const {
      name,
      category,
      price,
      isAvailable,
      description = ""
    } = req.body;

    const result = await pool.query(
      `UPDATE "Products"
       SET "Name" = $1,
           "Category" = $2,
           "Price" = $3,
           "IsAvailable" = $4,
           "Description" = $5
       WHERE "Id" = $6
       RETURNING *`,
      [name.trim(), category.trim(), Number(price), isAvailable, String(description).trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("PUT product error:", error.message);
    res.status(500).json({ error: "Ошибка изменения товара" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный идентификатор" });
    }

    const result = await pool.query(
      `DELETE FROM "Products"
       WHERE "Id" = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    res.json({ message: "Товар удалён", product: result.rows[0] });
  } catch (error) {
    console.error("DELETE product error:", error.message);
    res.status(500).json({ error: "Ошибка удаления товара" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Некорректный JSON" });
  }

  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server started on port ${port}`);
});
