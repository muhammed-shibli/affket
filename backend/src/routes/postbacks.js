const express = require('express');
const router = express.Router();
const postbackController = require('../controllers/postbackController');
const { authenticateToken } = require('../middleware/auth');
const { validatePostback } = require('../middleware/validation');

// Affiliate routes
router.get('/', authenticateToken, postbackController.getAllPostbacks);
router.get('/offer', authenticateToken, postbackController.getPostbacks);
router.get('/logs', authenticateToken, postbackController.getPostbackLogs);
router.post('/', authenticateToken, validatePostback, postbackController.createPostback);
router.put('/:id', authenticateToken, postbackController.updatePostback);
router.delete('/:id', authenticateToken, postbackController.deletePostback);

module.exports = router;
