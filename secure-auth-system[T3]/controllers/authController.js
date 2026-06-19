const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const signToken = (userId, email, role) => {
    return jwt.sign({ userId, email, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });
};

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return next(new AppError('A user with this email already exists.', 409));
        }

        const user = await User.create({ name, email, password });

        const token = signToken(user.id, user.email, user.role);

        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return next(new AppError('Invalid email or password.', 401));
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return next(new AppError('Invalid email or password.', 401));
        }

        const token = signToken(user.id, user.email, user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };
