# Bookmarks API

A small REST API for managing bookmarks/links, with optional JWT authentication. Built with **Node.js**, **Express**, and **SQLite**.

## Features

- **Auth:** Register and login; JWT required for all link operations
- **CRUD:** Create, read, update, delete links (url, title, tags)
- **Filter:** List links by tag (`?tag=...`) or search title/url (`?q=...`)

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and set JWT_SECRET
npm run dev
```

Server runs at `http://localhost:3000` (or `PORT` from `.env`).

## API

### Auth

| Method | Endpoint         | Body                      | Description                       |
| ------ | ---------------- | ------------------------- | --------------------------------- |
| POST   | `/auth/register` | `{ "email", "password" }` | Register; min 6 chars password    |
| POST   | `/auth/login`    | `{ "email", "password" }` | Login; returns `user` and `token` |

Use the `token` in the header for link endpoints:  
`Authorization: Bearer <token>`

### Links

All link routes require `Authorization: Bearer <token>`.

| Method | Endpoint     | Description                                                               |
| ------ | ------------ | ------------------------------------------------------------------------- |
| GET    | `/links`     | List your links. Query: `?tag=javascript`, `?q=github`                    |
| GET    | `/links/:id` | Get one link                                                              |
| POST   | `/links`     | Create link. Body: `{ "url", "title?", "tags?" }` (tags: string or array) |
| PUT    | `/links/:id` | Update link (partial). Body: `{ "url?", "title?", "tags?" }`              |
| DELETE | `/links/:id` | Delete link                                                               |

### Example

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secret123"}'

# Create bookmark (use token from register/login)
curl -X POST http://localhost:3000/links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"url":"https://github.com","title":"GitHub","tags":["dev","git"]}'

# List bookmarks, filter by tag
curl "http://localhost:3000/links?tag=dev" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project structure

```
bookmarks-api/
├── src/
│   ├── index.js      # Server entry
│   ├── app.js        # Express app and routes
│   ├── db.js         # SQLite connection and schema
│   ├── middleware/
│   │   └── auth.js   # JWT verification
│   └── routes/
│       ├── auth.js   # Register / login
│       └── links.js  # Links CRUD
├── data/             # SQLite DB (created on first run)
├── .env.example
├── package.json
└── README.md
```

## Author

**Billy John Miranda**

## License

MIT
