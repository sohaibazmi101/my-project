const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyCustomer = require('../middleware/verifyCustomer');

// This route creates a Razorpay order ID for the frontend.
// It does not create an order in your database yet.
router.post('/payments/create-razorpay-order', verifyCustomer, paymentController.createRazorpayOrder);

// This route is called from the frontend AFTER a successful payment.
// It verifies the signature and then creates the final order in the database.
router.post('/payments/create-final-order', verifyCustomer, paymentController.createFinalOrder);

// The webhook handler. The express.raw middleware is essential here to get the unparsed body
// for signature verification.
router.post(
  '/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

module.exports = router;
