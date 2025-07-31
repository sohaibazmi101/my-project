const express = require('express');
const router = express.Router();

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

const verifyCustomer = require('../middleware/verifyCustomer');

router.post('/google-login', googleLoginCustomer);

router.get('/profile', verifyCustomer, getCustomerProfile);
router.put('/profile', verifyCustomer, updateProfile);

router.post('/recently-viewed', verifyCustomer, addRecentlyViewed);
router.get('/recently-viewed', verifyCustomer, getRecentlyViewed);

router.post('/orders', verifyCustomer, placeOrder);
router.get('/orders', verifyCustomer, getCustomerOrders);

module.exports = router;
