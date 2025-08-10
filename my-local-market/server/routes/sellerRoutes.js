const express = require('express');
const router = express.Router();

// Middleware
const sellerAuth = require('../middleware/authMiddleware');
const uploadKycDocs = require('../middleware/uploadKycDocs');

// Controllers
const { registerSeller, getSellerProfile } = require('../controllers/sellerController');
const { loginSeller } = require('../controllers/authController');
const { getSellerOrders } = require('../controllers/orderController');
const { createShopForSeller } = require('../controllers/sellerController');

// @route   POST /api/seller/register
// @desc    Register seller with KYC documents
// Use only the middleware for KYC documents here
router.post('/register', uploadKycDocs.fields([
  { name: 'aadhaarImage', maxCount: 1 },
  { name: 'panImage', maxCount: 1 }
]), registerSeller);

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