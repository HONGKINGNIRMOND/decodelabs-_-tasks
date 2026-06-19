/**
 * middleware/errorHandler.js
 * ─────────────────────────
 * Centralised error-handling middleware.
 *
 * Express recognises error-handling middleware by its 4-parameter signature:
 *   (err, req, res, next) => { … }
 *
 * Every error thrown (or passed via next(err)) inside a route handler
 * bubbles up to this single function, which returns a consistent JSON
 * error response to the client.
 *
 * Design benefits:
 *  • DRY – error-formatting logic lives in ONE place.
 *  • Consistent API – clients always receive the same error shape.
 *  • Safe – stack traces are only exposed in development mode.
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
    // ── Determine HTTP status code ─────────────────────────────────────────────
    // If the controller set err.status (e.g. 400, 404, 409), use it.
    // Otherwise treat it as an unexpected server error (500).
    const statusCode = err.status || 500;

    // ── Build the response payload ─────────────────────────────────────────────
    const response = {
        status: 'error',
        message: err.message || 'Internal Server Error',
    };

    // In development, include the stack trace to help debugging.
    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }

    // ── Log to server console ─────────────────────────────────────────────────
    console.error(
        `[error] ${statusCode} – ${err.message}  (${req.method} ${req.originalUrl})`
    );

    // ── Send response ──────────────────────────────────────────────────────────
    res.status(statusCode).json(response);
};

module.exports = errorHandler;
