const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyCustomer = require('../middleware/verifyCustomer');

// NEW ROUTE: Only creates a Razorpay order ID. No database order is created yet.
router.post('/payments/create-razorpay-order', verifyCustomer, paymentController.createRazorpayOrder);

// NEW ROUTE: Creates the final order in the database after a successful payment.
// This route verifies the payment signature from the frontend before creating the order.
router.post('/payments/create-final-order', verifyCustomer, paymentController.createFinalOrder);

// The webhook handler, now with its specific middleware applied directly.
// This is a much cleaner way to handle it than in server.js.
router.post(
  '/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

module.exports = router;