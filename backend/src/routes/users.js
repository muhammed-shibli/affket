const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Admin routes
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);
router.get('/applications', authenticateToken, isAdmin, userController.getPendingApplications);
router.get('/:id', authenticateToken, isAdmin, userController.getUserDetails);
router.patch('/:id/status', authenticateToken, isAdmin, userController.updateUserStatus);
router.patch('/:id/features', authenticateToken, isAdmin, userController.updateUserFeatures);
router.patch('/applications/:id', authenticateToken, isAdmin, userController.updateOfferApplication);

module.exports = router;
