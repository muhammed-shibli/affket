const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Affiliate routes
router.get('/dashboard', authenticateToken, reportController.getDashboardStats);
router.get('/clicks', authenticateToken, reportController.getClicksReport);
router.get('/conversions', authenticateToken, reportController.getConversionsReport);

// Admin routes
router.get('/admin/dashboard', authenticateToken, isAdmin, reportController.getAdminDashboardStats);

module.exports = router;
