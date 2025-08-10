const express = require('express');
const router = express.Router();

// Middleware
const uploadBanner = require('../middleware/uploadBanner');
const sellerAuth = require('../middleware/authMiddleware'); // Renamed for clarity

// Controllers
const { registerSeller, getSellerProfile } = require('../controllers/sellerController');
const { loginSeller } = require('../controllers/authController');
const { getSellerOrders } = require('../controllers/orderController');
const uploadKycDocs = require('../middleware/uploadKycDocs');


router.post('/register', uploadKycDocs.fields([
  { name: 'aadhaar', maxCount: 1 },
  { name: 'pan', maxCount: 1 }
]), registerSeller);


// @route   POST /api/seller/register
// @desc    Register seller with optional banner
router.post('/register', uploadBanner, registerSeller);

// @route   POST /api/seller/login
// @desc    Seller login
router.post('/login', loginSeller);

// @route   GET /api/seller/me
// @desc    Get logged-in seller's profile
router.get('/me', sellerAuth, getSellerProfile);

// @route   GET /api/seller/orders
// @desc    Get all orders for logged-in seller
router.get('/orders', sellerAuth, getSellerOrders);

module.exports = router;
