const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order (no DB order yet)
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { cart } = req.body;
    const customerId = req.customer._id;

    const products = await Product.find({
      _id: { $in: cart.map(i => i.product) }
    }).populate('shop');

    let totalCartAmount = products.reduce((sum, product) => {
      const item = cart.find(i => i.product === product._id.toString());
      return sum + (item ? product.price * item.quantity : 0);
    }, 0);

    totalCartAmount = Math.round(totalCartAmount * 100); // paise

    if (totalCartAmount <= 0) {
      return res.status(400).json({ message: 'Invalid cart amount' });
    }

    // ✅ Short receipt ID to avoid 40 char limit
    const shortCustomerId = customerId.toString().substring(0, 8);
    const receiptId = `rcpt_${shortCustomerId}_${Date.now()}`;

    const razorpayOrder = await instance.orders.create({
      amount: totalCartAmount,
      currency: 'INR',
      receipt: receiptId,
      payment_capture: 1,
    });

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: totalCartAmount / 100,
      currency: 'INR',
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create final DB order after payment success
exports.createFinalOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cart } = req.body;
    const customerId = req.customer._id;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (existingOrder) {
      return res.status(200).json({ success: true, message: 'Order already exists' });
    }

    const products = await Product.find({ _id: { $in: cart.map(i => i.product) } }).populate('shop');

    const shopGroups = {};
    for (const item of cart) {
      const product = products.find(p => p._id.toString() === item.product);
      if (!product) continue;
      const shopId = product.shop._id.toString();
      if (!shopGroups[shopId]) shopGroups[shopId] = { shop: product.shop, items: [] };
      shopGroups[shopId].items.push({ product, quantity: item.quantity });
    }

    for (const shopId in shopGroups) {
      const { shop, items } = shopGroups[shopId];
      const orderProducts = items.map(i => ({ product: i.product._id, quantity: i.quantity }));
      const totalAmount = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

      const order = new Order({
        customer: customerId,
        shop: shop._id,
        products: orderProducts,
        totalAmount: Math.round(totalAmount * 100) / 100,
        paymentMethod: 'UPI',
        paymentStatus: 'completed',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });

      await order.save();
    }

    res.status(200).json({ success: true, message: 'Order created successfully' });

  } catch (error) {
    console.error('Error creating final order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Razorpay Webhook
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) return res.status(400).json({ message: 'Webhook signature not found' });

    // ✅ Ensure raw body is string for HMAC
    const rawBodyString = req.body instanceof Buffer
      ? req.body.toString('utf8')
      : JSON.stringify(req.body);

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
    shasum.update(rawBodyString);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBodyString);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const razorpayOrderId = event.payload.order?.entity?.id || event.payload.payment?.entity?.order_id;
      const paymentId = event.payload.payment?.entity?.id;

      const existingOrder = await Order.findOne({ razorpayOrderId });
      if (existingOrder) {
        if (existingOrder.paymentStatus !== 'completed') {
          existingOrder.paymentStatus = 'completed';
          existingOrder.razorpayPaymentId = paymentId;
          await existingOrder.save();
          console.log(`Webhook: Updated order ${existingOrder._id} to completed.`);
        }
      } else {
        const orderDetails = await instance.orders.fetch(razorpayOrderId);
        console.error(`Webhook: Order with ID ${razorpayOrderId} not found. Receipt: ${orderDetails.receipt}`);
      }
    } else if (event.event === 'payment.failed') {
      console.log(`Webhook: Payment failed for Razorpay order ${event.payload.payment.entity.order_id}.`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in webhook:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
