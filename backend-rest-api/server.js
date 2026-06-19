/**
 * server.js
 * ─────────
 * Entry-point for the Backend REST API.
 * Sets up Express, registers middleware, and mounts route handlers.
 *
 * Design principles demonstrated:
 *  • Stateless communication  – every request carries all data the server needs.
 *  • Separation of concerns   – routing, business logic, and error handling live in
 *                               separate modules.
 *  • Uniform interface         – JSON request/response for every endpoint.
 */

const express = require('express');
const cors = require('cors');

// ── Import route modules ─────────────────────────────────────────────────────
const userRoutes = require('./routes/users');

// ── Import middleware ────────────────────────────────────────────────────────
const errorHandler = require('./middleware/errorHandler');

// ── App bootstrap ────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ── Global middleware ────────────────────────────────────────────────────────
app.use(cors());              // Allow cross-origin requests (e.g. from a React app)
app.use(express.json());      // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ── Root health-check endpoint ───────────────────────────────────────────────
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Backend REST API is running',
        timestamp: new Date().toISOString(),
    });
});

// ── Route registration ───────────────────────────────────────────────────────
app.use('/api/users', userRoutes);

// ── 404 handler (catch-all for unmatched routes) ─────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route not found – ${req.method} ${req.originalUrl}`,
    });
});

// ── Centralised error-handling middleware (must have 4 params) ───────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
    console.log(`[server] Environment : ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; // Export for potential testing with supertest
