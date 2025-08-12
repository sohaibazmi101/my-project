const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order & pending DB orders
exports.createPayment = async (req, res) => {
  try {
    console.log('Received Create payment request body:', req.body);
    console.log('CustomerId:', req.customer._id);
    const { cart } = req.body; // [{ product: id, quantity: n }]
    const customerId = req.customer._id;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      console.log('Cart is empty or invalid:', cart);
      return res.status(400).json({ message: 'Cart is empty or invalid' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const shopGroups = {};
    let totalCartAmount = 0;

    const productIds = cart.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).populate('shop');

    for (const item of cart) {
      const product = products.find(p => p._id.toString() === item.product);
      if (!product) continue;

      const shopId = product.shop._id.toString();
      if (!shopGroups[shopId]) shopGroups[shopId] = { shop: product.shop, items: [] };

      shopGroups[shopId].items.push({ product, quantity: item.quantity });
      totalCartAmount += product.price * item.quantity;
    }

    // Razorpay requires amount in paise as an integer
    totalCartAmount = Math.round(totalCartAmount * 100); 

    // --- NEW DEBUGGING LOGS ---
    console.log(`Calculated total cart amount in paise: ${totalCartAmount}`);
    if (totalCartAmount <= 0) {
      console.error('Error: Total cart amount is zero or less. This will fail.');
      return res.status(400).json({ message: 'Invalid cart amount for payment' });
    }
    // --- END NEW DEBUGGING LOGS ---

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
        totalAmount: Math.round(totalAmount * 100) / 100,
        paymentMethod: 'UPI',
        paymentStatus: 'pending',
      });

      await order.save();
      pendingOrders.push(order);
    }

    // --- NEW DEBUGGING LOGS ---
    console.log('Successfully created pending orders in DB.');
    console.log(`Razorpay order creation payload: amount: ${totalCartAmount}, currency: 'INR', receipt: ${pendingOrders.map(o => o._id.toString()).join(',')}`);
    // --- END NEW DEBUGGING LOGS ---
    
    const razorpayOrder = await instance.orders.create({
      amount: totalCartAmount, // paise
      currency: 'INR',
      receipt: pendingOrders.map(o => o._id.toString()).join(','),
      payment_capture: 1,
    });

    await Order.updateMany(
      { _id: { $in: pendingOrders.map(o => o._id) } },
      { $set: { razorpayOrderId: razorpayOrder.id } }
    );

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: totalCartAmount / 100, // rupees
      currency: 'INR',
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Frontend verification endpoint
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const orders = await Order.find({ razorpayOrderId: razorpay_order_id });
    for (const order of orders) {
      if (order.paymentStatus !== 'completed') {
        order.paymentStatus = 'completed';
        await order.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Razorpay webhook handler
exports.handleWebhook = async (req, res) => {
  try {
    const rawBody = req.rawBody || req.body; // Ensure raw Buffer or string

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
    shasum.update(rawBody);
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBody.toString());

    console.log('Webhook event received:', event.event);

    if (event.event === 'payment.captured') {
      const receipt = event.payload.payment.entity.receipt;
      const orderIds = receipt.split(',');

      console.log('Receipt:', receipt);
      console.log('Order IDs:', orderIds);

      for (const orderId of orderIds) {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus !== 'completed') {
          order.paymentStatus = 'completed';
          await order.save();
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in webhook:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
