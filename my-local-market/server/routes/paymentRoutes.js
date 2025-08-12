const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyCustomer = require('../middleware/verifyCustomer');

// Create Razorpay Order ID
router.post('/payments/create-razorpay-order', verifyCustomer, paymentController.createRazorpayOrder);

// Create DB order after payment success
router.post('/payments/create-final-order', verifyCustomer, paymentController.createFinalOrder);

// Webhook route (raw body preserved)
router.post(
  '/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

module.exports = router;
