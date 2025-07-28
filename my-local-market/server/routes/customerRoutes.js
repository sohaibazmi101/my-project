const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  updateProfile,
  getCustomerProfile,
} = require('../controllers/customerController');
const { getCustomerOrders, placeOrder } = require('../controllers/orderController');
const verifyCustomer = require('../middleware/verifyCustomer');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

router.get('/profile', verifyCustomer, (req, res) => {
  res.json(req.customer);
});

router.put('/profile', verifyCustomer, updateProfile);
router.post('/orders', verifyCustomer, placeOrder);
router.get('/orders', verifyCustomer, getCustomerOrders);

module.exports = router;
