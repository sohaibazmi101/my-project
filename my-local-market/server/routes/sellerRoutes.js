const express = require('express');
const router = express.Router();

const uploadBanner = require('../middleware/uploadBanner');
const authMiddleware = require('../middleware/authMiddleware');

// Controllers
const { registerSeller, getSellerProfile } = require('../controllers/sellerController');
const { loginSeller } = require('../controllers/authController');

// ✅ Register seller with optional banner
router.post('/register', uploadBanner, registerSeller);

// ✅ Login seller
router.post('/login', loginSeller);

// ✅ Get logged-in seller's profile
router.get('/me', authMiddleware, getSellerProfile);

module.exports = router;
