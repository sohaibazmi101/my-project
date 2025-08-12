const express = require('express');
const router = express.Router();

// Middleware
const sellerAuth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const uploadKycDocs = require('../middleware/uploadKycDocs');

// Controllers
const { registerSeller, getSellerProfile } = require('../controllers/sellerController');
const { loginSeller } = require('../controllers/authController');
const { getSellerOrders, updateOrderStatus } = require('../controllers/orderController');
const { getPendingKycs, updateKycStatus, createShopForSeller } = require('../controllers/sellerController');

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
router.post('/create-shop', sellerAuth, createShopForSeller);

// Add this line to your seller routes file
router.get('/kyc/pending', adminAuth, getPendingKycs);
router.put('/:sellerId/kyc', adminAuth, updateKycStatus);

// @route   GET /api/seller/orders
// @desc    Get all orders for logged-in seller
router.get('/orders', sellerAuth, getSellerOrders);
router.put('/orders/:orderId/status', sellerAuth, updateOrderStatus);

module.exports = router;