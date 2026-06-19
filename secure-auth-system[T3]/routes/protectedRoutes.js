const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getProfile,
    getAdmin,
} = require('../controllers/protectedController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboard);
router.get('/profile', protect, getProfile);
router.get('/admin', protect, restrictTo('admin'), getAdmin);

module.exports = router;
