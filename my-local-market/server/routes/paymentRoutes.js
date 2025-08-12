const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyCustomer = require('../middleware/verifyCustomer');

// Ensure JSON parsing for these two routes while preserving raw body for webhook
router.post(
  '/payments/create-razorpay-order',
  express.json(),              // <-- parse JSON for this route only
  verifyCustomer,
  paymentController.createRazorpayOrder
);

router.post(
  '/payments/create-final-order',
  express.json(),              // <-- parse JSON for this route only
  verifyCustomer,
  paymentController.createFinalOrder
);

// Webhook route must use raw body
router.post(
  '/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

module.exports = router;
