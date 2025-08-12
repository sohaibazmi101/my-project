const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyCustomer = require('../middleware/verifyCustomer');

router.post('/payments/create-payment', verifyCustomer, paymentController.createPayment);

// The `express.raw` middleware is now handled in server.js, so remove it here.
router.post(
  '/payments/webhook',
  paymentController.handleWebhook
);

router.post('/payments/verify', verifyCustomer, paymentController.verifyPayment);

module.exports = router;