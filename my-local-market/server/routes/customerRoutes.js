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
  calculateOrder,
} = require('../controllers/orderController');

// --- Public Routes ---
router.post('/google-login', googleLoginCustomer);

// --- Protected Routes ---
router.use(verifyCustomer);

router.get('/profile', getCustomerProfile);
router.patch('/profile', updateProfile); // can use PATCH or PUT
router.put('/profile', updateProfile);

router.post('/recently-viewed', addRecentlyViewed);
router.get('/recently-viewed', getRecentlyViewed);

router.post('/orders', placeOrder);
router.post('/calculate-order', calculateOrder);
router.get('/orders', getCustomerOrders);

module.exports = router;
