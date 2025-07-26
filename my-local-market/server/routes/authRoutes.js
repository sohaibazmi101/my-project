// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// ✅ Use registerSeller from sellerController
const { registerSeller } = require('../controllers/sellerController');

// ✅ Keep loginSeller from authController
const { loginSeller } = require('../controllers/authController');

// Routes
router.post('/seller/register', registerSeller);
router.post('/seller/login', loginSeller);

module.exports = router;
