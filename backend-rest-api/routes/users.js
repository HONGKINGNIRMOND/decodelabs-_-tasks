/**
 * routes/users.js
 * ────────────────
 * Express Router that maps HTTP verbs + paths to controller functions.
 *
 * REST mapping:
 *   GET    /api/users        → list all users
 *   GET    /api/users/:id    → get a single user
 *   POST   /api/users        → create a new user
 *   PUT    /api/users/:id    → full update (replace) a user
 *   PATCH  /api/users/:id    → partial update a user
 *   DELETE /api/users/:id    → remove a user
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ── Collection routes (/api/users) ──────────────────────────────────────────
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

// ── Resource routes (/api/users/:id) ────────────────────────────────────────
router
    .route('/:id')
    .get(userController.getUserById)
    .put(userController.updateUser)
    .patch(userController.patchUser)
    .delete(userController.deleteUser);

module.exports = router;
