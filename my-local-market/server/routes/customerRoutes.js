const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  updateProfile
} = require('../controllers/customerController');
const { getCustomerOrders, placeOrder } = require('../controllers/orderController');
const verifyCustomer = require('../middleware/verifyCustomer');

router.put('/profile', verifyCustomer, updateProfile);
router.post('/orders', verifyCustomer, placeOrder);
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/orders', verifyCustomer, getCustomerOrders);

module.exports = router;
