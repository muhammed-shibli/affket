const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const offerController = require('../controllers/offerController');
const { authenticateToken, isAdmin, isAffiliate } = require('../middleware/auth');
const { validateOffer } = require('../middleware/validation');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'offer-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Public routes
router.get('/categories', offerController.getCategories);

// Affiliate routes
router.get('/', authenticateToken, offerController.getAllOffers);
router.get('/approved', authenticateToken, offerController.getApprovedOffers);
router.get('/:id', authenticateToken, offerController.getOfferDetails);
router.post('/apply', authenticateToken, offerController.applyForOffer);

// Admin routes
router.get('/admin/all', authenticateToken, isAdmin, offerController.adminGetAllOffers);
router.post('/admin/create', authenticateToken, isAdmin, upload.single('logo'), offerController.createOffer);
router.put('/admin/:id', authenticateToken, isAdmin, upload.single('logo'), offerController.updateOffer);
router.patch('/admin/:id/status', authenticateToken, isAdmin, offerController.toggleOfferStatus);
router.post('/admin/categories', authenticateToken, isAdmin, offerController.createCategory);

module.exports = router;
