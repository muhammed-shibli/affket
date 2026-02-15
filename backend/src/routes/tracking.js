const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// Public tracking routes (no auth required)
router.get('/track/:offer_id/:user_id', trackingController.trackClick);
router.get('/postback', trackingController.trackConversion);

module.exports = router;
