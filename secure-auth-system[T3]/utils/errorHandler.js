const AppError = require('./AppError');

const handleSequelizeValidationError = (err) => {
    const errors = err.errors.map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleSequelizeUniqueConstraintError = (err) => {
    const fields = err.errors.map((el) => el.path).join(', ');
    const message = `Duplicate field value: ${fields}. Please use another value.`;
    return new AppError(message, 409);
};

const handleSequelizeForeignKeyError = (err) => {
    const message = 'Referenced record does not exist.';
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    } else {
        console.error('ERROR:', err);
        res.status(500).json({
            success: false,
            message: 'Something went wrong.',
        });
    }
};

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err, message: err.message };

        if (err.name === 'SequelizeValidationError')
            error = handleSequelizeValidationError(err);
        if (err.name === 'SequelizeUniqueConstraintError')
            error = handleSequelizeUniqueConstraintError(err);
        if (err.name === 'SequelizeForeignKeyConstraintError')
            error = handleSequelizeForeignKeyError(err);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

module.exports = globalErrorHandler;
