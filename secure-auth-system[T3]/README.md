# Secure Authentication System

A production-ready backend authentication system built with Node.js, Express.js, and MySQL. Follows modern security standards and OWASP recommendations.


## Features

- User registration with input validation and duplicate email prevention
- Secure password hashing using **Argon2id**
- JWT-based authentication with configurable expiration
- Role-based authorization (user/admin)
- Protected routes with middleware enforcement
- Security headers via Helmet
- CORS support
- Request body validation with express-validator
- Global error handling with safe production error messages

## Project Structure

```
secure-auth-system/
├── controllers/
│   ├── authController.js        # Register & login logic
│   └── protectedController.js   # Dashboard, profile, admin endpoints
├── middleware/
│   ├── auth.js                  # JWT verification & role restriction
│   └── validate.js              # Request validation middleware
├── models/
│   └── User.js                  # Sequelize User model with Argon2 hashing
├── routes/
│   ├── authRoutes.js            # Auth route definitions
│   └── protectedRoutes.js       # Protected route definitions
├── config/
│   └── database.js              # MySQL/Sequelize connection configuration
├── utils/
│   ├── AppError.js              # Custom error class
│   ├── errorHandler.js          # Global error handler
│   └── validators.js            # Input validation rules
├── .env                         # Environment variables (not committed)
├── .env.example                 # Environment variable template
├── .gitignore
├── server.js                    # Application entry point
├── package.json
└── Secure_Auth_System.postman_collection.json
```

## Prerequisites

- **Node.js** >= 18.x
- **MySQL** >= 8.x running locally or a remote MySQL instance

## Setup Instructions

### 1. Install Dependencies

```bash
cd secure-auth-system
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` and update the values:


| Variable         | Description                                      | Default                          |
| ---------------- | ------------------------------------------------ | -------------------------------- |
| `PORT`           | Server listening port                            | `5000`                           |
| `DB_HOST`        | MySQL server host                                | `localhost`                      |
| `DB_PORT`        | MySQL server port                                | `3306`                           |
| `DB_USER`        | MySQL username                                   | `root`                           |
| `DB_PASSWORD`    | MySQL password                                   | —                                |
| `DB_NAME`        | MySQL database name                              | `secure_auth_system`             |
| `JWT_SECRET`     | Secret key for signing JWTs (use a strong value) | —                                |
| `JWT_EXPIRES_IN` | JWT token expiration time                       | `1h`                             |

### 3. Start the Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:5000`.

## API Endpoints

### Authentication

| Method | Endpoint              | Description            | Auth Required |
| ------ | --------------------- | ---------------------- | ------------- |
| POST   | `/api/auth/register`  | Register a new user    | No            |
| POST   | `/api/auth/login`     | Login and receive JWT  | No            |

### Protected Routes

| Method | Endpoint          | Description            | Auth Required | Role     |
| ------ | ----------------- | ---------------------- | ------------- | -------- |
| GET    | `/api/dashboard`  | Access user dashboard  | Yes           | Any      |
| GET    | `/api/profile`    | View user profile      | Yes           | Any      |
| GET    | `/api/admin`      | Access admin panel     | Yes           | `admin`  |

### Health Check

| Method | Endpoint       | Description       |
| ------ | -------------- | ----------------- |
| GET    | `/api/health`  | Server health check |

## Request/Response Examples

### Register

```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}

// 201 Created
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "user" },
    "token": "eyJhbGciOiJI..."
  }
}
```

### Login

```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "Password123"
}

// 200 OK
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "user" },
    "token": "eyJhbGciOiJI..."
  }
}
```

### Access Protected Route

```
GET /api/dashboard
Authorization: Bearer <token>

// 200 OK
{
  "success": true,
  "message": "Welcome to the dashboard.",
  "data": { ... }
}
```

## Authentication Workflow

1. **Register** — User submits name, email, and password. The password is hashed with Argon2id before storage. A JWT is returned.
2. **Login** — User submits email and password. Credentials are verified against stored hash. A JWT is returned.
3. **Access Protected Routes** — Client sends the JWT in the `Authorization: Bearer <token>` header. The middleware verifies the token, checks expiration, and attaches the user to `req.user`.
4. **Role-Based Access** — The `restrictTo('admin')` middleware checks `req.user.role`. Returns 403 Forbidden if insufficient permissions.

### JWT Payload

```json
{
  "userId": 1,
  "email": "john@example.com",
  "role": "user",
  "iat": 1700000000,
  "exp": 1700003600
}
```

## Postman Testing Guide

### Import Collection

1. Open Postman.
2. Click **Import** and select `Secure_Auth_System.postman_collection.json`.
3. The collection includes pre-configured requests for all endpoints.

### Test Scenarios

| # | Test                                | Expected Result                 |
| - | ----------------------------------- | ------------------------------- |
| 1 | Register with valid data            | 201 — user created, token returned |
| 2 | Register with duplicate email       | 409 — conflict error            |
| 3 | Register with invalid data          | 400 — validation errors         |
| 4 | Login with correct credentials      | 200 — token returned            |
| 5 | Login with wrong password           | 401 — unauthorized              |
| 6 | Access dashboard without token      | 401 — unauthorized              |
| 7 | Access dashboard with valid token   | 200 — dashboard data            |
| 8 | Access admin as regular user        | 403 — forbidden                 |
| 9 | Access admin as admin               | 200 — admin panel data          |
| 10| Access route with invalid token     | 401 — unauthorized              |
| 11| Access route with expired token     | 401 — token expired             |

### Creating an Admin User

To test admin routes, manually update a user's role in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Then login as that user to receive an admin JWT.

## Output Screenshots

### MySQL Database

![MySQL Database](output%20images/mysql.png)

The `users` table in the `secure_auth_system` MySQL database, showing the stored user record with Argon2id-hashed password.

### User Registration

![Register](output%20images/register.png)

Successful registration via `POST /api/auth/register` — returns `201 Created` with user details and a JWT token.

### User Login

![Login](output%20images/login.png)

Successful login via `POST /api/auth/login` — returns `200 OK` with user details and a JWT token.

### Protected Dashboard

![Dashboard](output%20images/Dashboard.png)

Accessing the protected dashboard via `GET /api/dashboard` with Bearer Token authorization — returns user info and login stats.

## Security Practices

- **Argon2id** password hashing (OWASP recommended)
- **Helmet** for HTTP security headers
- **CORS** configured for cross-origin requests
- **Input validation** on all endpoints
- **JWT expiration** to limit token lifetime
- **No sensitive data** in error responses (production mode)
- **Body size limits** (10KB) to prevent large payload attacks
- **Environment variables** for all secrets
- **.env excluded** from version control


