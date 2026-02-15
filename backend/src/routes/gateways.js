const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gatewayController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateGateway } = require('../middleware/validation');

// Admin routes
router.get('/', authenticateToken, isAdmin, gatewayController.getAllGateways);
router.get('/:id', authenticateToken, isAdmin, gatewayController.getGateway);
router.post('/', authenticateToken, isAdmin, validateGateway, gatewayController.createGateway);
router.put('/:id', authenticateToken, isAdmin, gatewayController.updateGateway);
router.delete('/:id', authenticateToken, isAdmin, gatewayController.deleteGateway);
router.patch('/:id/status', authenticateToken, isAdmin, gatewayController.toggleGatewayStatus);

module.exports = router;
