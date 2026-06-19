/**
 * controllers/userController.js
 * ─────────────────────────────
 * Contains the business logic for every user-related endpoint.
 *
 * Design notes:
 *  • The "database" is an in-memory array – perfect for training / demos.
 *    Swap it for MongoDB, PostgreSQL, etc. in production.
 *  • Every handler follows the same pattern:
 *      1. Validate input
 *      2. Perform the operation
 *      3. Return a JSON response with an appropriate HTTP status code
 *  • Errors are forwarded to the centralised error-handler via next().
 */

const { v4: uuidv4 } = require('uuid');

// ── In-memory "database" ─────────────────────────────────────────────────────
let users = [
    {
        id: uuidv4(),
        name: 'Alice Johnson',
        email: 'alice@example.com',
        age: 28,
        role: 'admin',
        createdAt: new Date('2024-01-15').toISOString(),
    },
    {
        id: uuidv4(),
        name: 'Bob Smith',
        email: 'bob@example.com',
        age: 34,
        role: 'user',
        createdAt: new Date('2024-03-22').toISOString(),
    },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Simple email-format validator (good enough for demo purposes).
 */
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Create a custom error and forward it to the error-handler middleware.
 */
const createError = (statusCode, message) => {
    const err = new Error(message);
    err.status = statusCode;
    return err;
};

// ── Controller functions ─────────────────────────────────────────────────────

/**
 * GET /api/users
 * Returns the full list of users.
 * Supports optional query-string filtering:  ?role=admin&name=alice
 */
exports.getAllUsers = (req, res, next) => {
    try {
        let result = [...users];

        // Optional filters (case-insensitive)
        const { role, name } = req.query;

        if (role) {
            result = result.filter(
                (u) => u.role.toLowerCase() === role.toLowerCase()
            );
        }

        if (name) {
            result = result.filter((u) =>
                u.name.toLowerCase().includes(name.toLowerCase())
            );
        }

        res.status(200).json({
            status: 'success',
            count: result.length,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/users/:id
 * Returns a single user by UUID.
 */
exports.getUserById = (req, res, next) => {
    try {
        const user = users.find((u) => u.id === req.params.id);

        if (!user) {
            throw createError(404, `User with id "${req.params.id}" not found`);
        }

        res.status(200).json({
            status: 'success',
            data: user,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/users
 * Creates a new user.
 * Required fields: name, email
 * Optional fields: age, role  (defaults to "user")
 */
exports.createUser = (req, res, next) => {
    try {
        const { name, email, age, role } = req.body;

        // ── Validation ────────────────────────────────────────────────────────
        if (!name || !email) {
            throw createError(400, '"name" and "email" are required fields');
        }

        if (typeof name !== 'string' || name.trim().length === 0) {
            throw createError(400, '"name" must be a non-empty string');
        }

        if (!isValidEmail(email)) {
            throw createError(400, '"email" must be a valid email address');
        }

        // Prevent duplicate emails
        const emailExists = users.some(
            (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (emailExists) {
            throw createError(409, `A user with email "${email}" already exists`);
        }

        if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 150)) {
            throw createError(400, '"age" must be a number between 0 and 150');
        }

        // ── Create ────────────────────────────────────────────────────────────
        const newUser = {
            id: uuidv4(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            age: age ?? null,
            role: role && ['admin', 'user', 'moderator'].includes(role) ? role : 'user',
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: newUser,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/users/:id
 * Full replacement of a user resource.
 * All required fields must be supplied; unspecified optional fields are nulled.
 */
exports.updateUser = (req, res, next) => {
    try {
        const index = users.findIndex((u) => u.id === req.params.id);

        if (index === -1) {
            throw createError(404, `User with id "${req.params.id}" not found`);
        }

        const { name, email, age, role } = req.body;

        // ── Validation (same rules as create) ─────────────────────────────────
        if (!name || !email) {
            throw createError(400, '"name" and "email" are required for a full update (PUT)');
        }

        if (typeof name !== 'string' || name.trim().length === 0) {
            throw createError(400, '"name" must be a non-empty string');
        }

        if (!isValidEmail(email)) {
            throw createError(400, '"email" must be a valid email address');
        }

        if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 150)) {
            throw createError(400, '"age" must be a number between 0 and 150');
        }

        // Prevent duplicate emails (but allow the user to keep their own)
        const emailExists = users.some(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== req.params.id
        );
        if (emailExists) {
            throw createError(409, `A user with email "${email}" already exists`);
        }

        // ── Full replace ──────────────────────────────────────────────────────
        const updatedUser = {
            id: users[index].id,         // id is immutable
            name: name.trim(),
            email: email.trim().toLowerCase(),
            age: age ?? null,
            role: role && ['admin', 'user', 'moderator'].includes(role) ? role : 'user',
            createdAt: users[index].createdAt,  // createdAt is immutable
        };

        users[index] = updatedUser;

        res.status(200).json({
            status: 'success',
            message: 'User updated successfully (full replace)',
            data: updatedUser,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/users/:id
 * Partial update – only supplied fields are modified.
 */
exports.patchUser = (req, res, next) => {
    try {
        const index = users.findIndex((u) => u.id === req.params.id);

        if (index === -1) {
            throw createError(404, `User with id "${req.params.id}" not found`);
        }

        const { name, email, age, role } = req.body;

        if (Object.keys(req.body).length === 0) {
            throw createError(400, 'Request body is empty – nothing to patch');
        }

        // ── Validate only the fields that are present ─────────────────────────
        if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
            throw createError(400, '"name" must be a non-empty string');
        }

        if (email !== undefined) {
            if (!isValidEmail(email)) {
                throw createError(400, '"email" must be a valid email address');
            }
            const emailExists = users.some(
                (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== req.params.id
            );
            if (emailExists) {
                throw createError(409, `A user with email "${email}" already exists`);
            }
        }

        if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 150)) {
            throw createError(400, '"age" must be a number between 0 and 150');
        }

        if (role !== undefined && !['admin', 'user', 'moderator'].includes(role)) {
            throw createError(400, '"role" must be one of: admin, user, moderator');
        }

        // ── Partial update ─────────────────────────────────────────────────────
        const updatedUser = { ...users[index] };

        if (name !== undefined) updatedUser.name = name.trim();
        if (email !== undefined) updatedUser.email = email.trim().toLowerCase();
        if (age !== undefined) updatedUser.age = age;
        if (role !== undefined) updatedUser.role = role;

        users[index] = updatedUser;

        res.status(200).json({
            status: 'success',
            message: 'User updated successfully (partial update)',
            data: updatedUser,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/users/:id
 * Removes a user from the store.
 */
exports.deleteUser = (req, res, next) => {
    try {
        const index = users.findIndex((u) => u.id === req.params.id);

        if (index === -1) {
            throw createError(404, `User with id "${req.params.id}" not found`);
        }

        const [deletedUser] = users.splice(index, 1);

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully',
            data: deletedUser,
        });
    } catch (err) {
        next(err);
    }
};
