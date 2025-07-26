const express = require('express');
const router = express.Router();

const uploadBanner = require('../middleware/uploadBanner');
const { registerSeller } = require('../controllers/sellerController');

// ✅ Register Seller (Cloudinary-based upload)
router.post('/register', uploadBanner, registerSeller);

module.exports = router;
