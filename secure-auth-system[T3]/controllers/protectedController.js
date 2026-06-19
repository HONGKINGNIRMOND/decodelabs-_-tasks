const getDashboard = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the dashboard.',
        data: {
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
            stats: {
                totalLogins: 42,
                lastActive: new Date().toISOString(),
            },
        },
    });
};

const getProfile = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully.',
        data: {
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                createdAt: req.user.createdAt,
                updatedAt: req.user.updatedAt,
            },
        },
    });
};

const getAdmin = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the admin panel.',
        data: {
            admin: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
            },
            systemInfo: {
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
            },
        },
    });
};

module.exports = { getDashboard, getProfile, getAdmin };
