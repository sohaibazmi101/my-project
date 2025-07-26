const express = require('express');
const router = express.Router();

const uploadBanner = require('../middleware/uploadBanner');
const { registerSeller } = require('../controllers/sellerController');

// ✅ Register Seller with optional banner upload
router.post('/register', uploadBanner.single('banner'), registerSeller);

module.exports = router;
