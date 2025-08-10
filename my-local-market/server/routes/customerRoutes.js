const express = require('express');
const router = express.Router();
const verifyCustomer = require('../middleware/verifyCustomer');

const {
  googleLoginCustomer,
  updateProfile,
  getCustomerProfile,
  addRecentlyViewed,
  getRecentlyViewed,
} = require('../controllers/customerController');

const {
  getCustomerOrders,
  placeOrder,
} = require('../controllers/orderController');

// --- Public Routes (No Auth Needed) ---
router.post('/google-login', googleLoginCustomer);

// --- Protected Routes (Auth Needed) ---
router.use(verifyCustomer); // Apply middleware to all routes below

router.get('/profile', getCustomerProfile);
router.put('/profile', updateProfile);

router.post('/recently-viewed', addRecentlyViewed);
router.get('/recently-viewed', getRecentlyViewed);

router.post('/orders', placeOrder);
router.get('/orders', getCustomerOrders);

module.exports = router;