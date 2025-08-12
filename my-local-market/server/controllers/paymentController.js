const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

    totalCartAmount = Math.round(totalCartAmount * 100);

    if (totalCartAmount <= 0) {
      return res.status(400).json({ message: 'Invalid cart amount' });
    }

    const razorpayOrder = await instance.orders.create({
      amount: totalCartAmount,
      currency: 'INR',
      receipt: `receipt_${customerId}_${Date.now()}`,
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
    
    const finalOrders = [];
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
        paymentStatus: 'completed', // Set directly to completed
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });

      await order.save();
      finalOrders.push(order);
    }
    
    res.status(200).json({ success: true, message: 'Order created successfully' });

  } catch (error) {
    console.error('Error creating final order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const rawBody = req.body;
    const signature = req.headers['x-razorpay-signature'];
    
    if (!signature) return res.status(400).json({ message: 'Webhook signature not found' });
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
    shasum.update(rawBody);
    if (shasum.digest('hex') !== signature) return res.status(400).json({ message: 'Invalid webhook signature' });

    const event = JSON.parse(rawBody.toString());

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
        const receipt = orderDetails.receipt;
        console.error(`Webhook: Order with ID ${razorpayOrderId} not found. Manual intervention may be needed.`);
      }
    } else if (event.event === 'payment.failed') {
      console.log(`Webhook: Payment failed for Razorpay order ${event.payload.payment.entity.order_id}. No action needed.`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in webhook:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
