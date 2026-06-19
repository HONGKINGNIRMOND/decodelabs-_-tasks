# Backend REST API
TASK 1: Build a RESTful API using Node.js and Express that supports CRUD operations for a simple resource (e.g., users, products, etc.). The API should follow REST principles, including proper HTTP methods, status codes, and URL structures.

## Project Structure

```
backend-rest-api/
├── server.js                  # Entry-point – Express setup, middleware, route mounting
├── routes/
│   └── users.js               # Route definitions (maps HTTP verbs → controllers)
├── controllers/
│   └── userController.js      # Business logic for every user endpoint
├── middleware/
│   └── errorHandler.js        # Centralised error-handling middleware
├── package.json
└── README.md
```

---

## REST Principles Demonstrated

| Principle | How it is applied |
|---|---|
| **Statelessness** | Every request carries all the data the server needs; no session state is stored server-side. |
| **Uniform Interface** | All endpoints accept and return JSON. HTTP verbs (GET, POST, PUT, PATCH, DELETE) map directly to CRUD operations. |
| **Resource-Based URLs** | `/api/users` (collection) and `/api/users/:id` (single resource). |
| **Proper HTTP Status Codes** | `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`. |
| **Separation of Concerns** | Routes, controllers, and middleware live in separate files. |

---

## Running the Server

```bash
# Development mode (auto-restart on file changes – requires Node v18+)
npm run dev
```

You should see:

```
[server] Listening on http://localhost:3000
[server] Environment : development
```

The API is now available at **http://localhost:3000**.

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/` | Health-check |
| `GET` | `/api/users` | List all users (supports `?role=` and `?name=` filters) |
| `GET` | `/api/users/:id` | Get a single user by ID |
| `POST` | `/api/users` | Create a new user |
| `PUT` | `/api/users/:id` | Full update (replace) a user |
| `PATCH` | `/api/users/:id` | Partial update a user |
| `DELETE` | `/api/users/:id` | Delete a user |

---

## Sample Output

Below are screenshots of the API responses captured during testing.

### Health Check – `GET /`

![Health Check Response](output%20images/health.png)

### List All Users – `GET /api/users`

![List Users Response](output%20images/users.png)

### Add a New User – `POST /api/users`

![Add User Response](output%20images/add_users.png)

---

