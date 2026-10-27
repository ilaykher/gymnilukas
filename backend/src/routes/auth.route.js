const express = require('express');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const rateLimit = require('../utils/rateLimit');

const router = express.Router();
router.post('/login', rateLimit({ limit: 10, windowMs: 15 * 60 * 1000 }), authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);
router.post('/verify-password', requireAuth, authController.verifyPassword);
router.post('/change-password', requireAuth, authController.changePassword);

module.exports = router;
