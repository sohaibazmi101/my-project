const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyCustomer = require('../middleware/verifyCustomer');

// Step 1: Create order (frontend calls this before payment)
router.post('/customers/create-payment', verifyCustomer, paymentController.createPayment);

// Step 2: Webhook from Razorpay after payment is completed
router.post(
  '/payment/webhook',
  express.raw({ type: 'application/json' }), // Keep raw body for signature verification
  paymentController.handleWebhook
);

module.exports = router;
