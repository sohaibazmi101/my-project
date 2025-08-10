// src/controllers/paymentController.js

const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createPayment = async (req, res) => {
  try {
    const { cart } = req.body; // Expected: [{ product: id, quantity: n }]
    const customerId = req.customer._id;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or invalid' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const shopGroups = {};
    let totalCartAmount = 0;

    for (const item of cart) {
      const product = await Product.findById(item.product).populate('shop');
      if (!product) continue;

      const shopId = product.shop._id.toString();
      if (!shopGroups[shopId]) {
        shopGroups[shopId] = { shop: product.shop, items: [] };
      }

      shopGroups[shopId].items.push({ product, quantity: item.quantity });
      totalCartAmount += product.price * item.quantity;
    }

    const pendingOrders = [];
    for (const shopId in shopGroups) {
      const { shop, items } = shopGroups[shopId];

      const orderProducts = items.map(i => ({
        product: i.product._id,
        quantity: i.quantity,
      }));

      const totalAmount = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

      const order = new Order({
        customer: customerId,
        shop: shop._id,
        products: orderProducts,
        totalAmount,
        paymentMethod: 'UPI',
        paymentStatus: 'Pending',
      });

      await order.save();
      pendingOrders.push(order);
    }
    
    // Create a single Razorpay order for the entire cart's total amount
    const razorpayOrder = await instance.orders.create({
      amount: totalCartAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: pendingOrders.map(o => o._id).join(','), // Store a list of your order IDs
    });

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: totalCartAmount,
      currency: 'INR',
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// src/controllers/paymentController.js

exports.handleWebhook = async (req, res) => {
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    const { payload } = req.body;
    const receipt = payload.payment.entity.receipt;

    // Split the comma-separated string of IDs into an array
    const orderIds = receipt.split(',');

    // Iterate through each order ID and update the payment status
    for (const orderId of orderIds) {
        // You can add error handling here in case an ID is invalid
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Completed' });
    }
  }

  res.json({ success: true });
};