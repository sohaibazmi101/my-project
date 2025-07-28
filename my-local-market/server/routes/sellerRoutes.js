const express = require('express');
const router = express.Router();

const uploadBanner = require('../middleware/uploadBanner');
const { registerSeller, getSellerProfile } = require('../controllers/sellerController');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Register Seller
router.post('/register', uploadBanner, registerSeller);

// ✅ Fetch logged-in seller profile
router.get('/me', authMiddleware, getSellerProfile);

module.exports = router;
