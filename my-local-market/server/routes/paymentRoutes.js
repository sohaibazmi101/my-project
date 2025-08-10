const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyCustomer = require('../middleware/verifyCustomer'); // Import your customer auth middleware

// This route is called by the frontend to initiate a payment
router.post('/customers/create-payment', verifyCustomer, paymentController.createPayment);

// This route receives the webhook from Razorpay after a payment is completed
router.post('/payment/webhook', paymentController.handleWebhook);

module.exports = router;