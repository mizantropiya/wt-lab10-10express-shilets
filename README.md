# WT-10 - Express + PostgreSQL

Лабораторная работа WT-10: REST API на Node.js/Express с подключением PostgreSQL через пакет `pg` и `Pool`.

## Запуск

```powershell
npm install
$env:DATABASE_URL="postgresql://user:password@host:5432/database"
npm run db:setup
npm start
```

Локальный адрес: `http://localhost:3000`.

## API

- `GET /`
- `GET /api/info`
- `POST /api/test`
- `GET /api/db-test`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/search?name=...`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

## Render

- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variable: `DATABASE_URL` = Internal Database URL PostgreSQL

После публикации добавить сюда публичный URL Render и URL GitHub.

Render Web Service must listen on process.env.PORT and 0.0.0.0.

`npm start` автоматически выполняет `prestart`, поэтому перед запуском проверяет/создаёт таблицу `Products` в указанной PostgreSQL. Скрипт идемпотентен и не создаёт новую базу данных.
