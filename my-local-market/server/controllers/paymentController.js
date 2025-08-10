const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createPayment = async (req, res) => {
  try {
    const { amount, orderItems } = req.body;
    const customerId = req.customer._id;

    const order = await Order.create({
      customer: customerId,
      products: orderItems,
      totalAmount: amount,
      paymentMethod: 'UPI',
      paymentStatus: 'Pending',
    });

    const razorpayOrder = await instance.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: order._id.toString(),
    });

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.handleWebhook = async (req, res) => {
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    const { payload } = req.body;
    const orderId = payload.payment.entity.receipt;

    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Completed' });
  }

  res.json({ success: true });
};