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

// --- Public Routes (No Auth Needed) ---
router.post('/google-login', googleLoginCustomer);

// --- Protected Routes (Auth Needed) ---
router.use(verifyCustomer);

router.get('/profile', getCustomerProfile);
router.patch('/profile', updateProfile); // add this
router.put('/profile', updateProfile);


router.post('/recently-viewed', addRecentlyViewed);
router.get('/recently-viewed', getRecentlyViewed);

router.post('/orders', placeOrder);
router.post('/calculate-order', calculateOrder);
router.get('/orders', getCustomerOrders);

module.exports = router;