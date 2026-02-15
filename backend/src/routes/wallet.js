const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateWithdrawal } = require('../middleware/validation');

// Affiliate routes
router.get('/', authenticateToken, walletController.getWallet);
router.post('/withdraw', authenticateToken, validateWithdrawal, walletController.requestWithdrawal);

// Admin routes
router.get('/admin/withdrawals', authenticateToken, isAdmin, walletController.getAllWithdrawals);
router.patch('/admin/withdrawals/:id', authenticateToken, isAdmin, walletController.updateWithdrawalStatus);

module.exports = router;
