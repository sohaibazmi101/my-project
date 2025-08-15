const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { calculateOrderSummary } = require('../utils/orderUtils');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order (pre-payment)
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { cart, productId, quantity, customerLat, customerLon } = req.body;
    const customerId = req.customer._id;

    // Calculate validated order summary
    const orderSummary = await calculateOrderSummary({ cart, productId, quantity, customerLat, customerLon });

    if (!orderSummary || orderSummary.length === 0) {
      return res.status(400).json({ message: 'Unable to calculate order for payment' });
    }

    // Compute total amount for Razorpay (sum of all shop totals)
    const totalAmount = Math.round(orderSummary.reduce((sum, shopOrder) => sum + shopOrder.totalAmount, 0) * 100); // paise

    if (totalAmount <= 0) return res.status(400).json({ message: 'Invalid order amount' });

    // Create Razorpay order
    const receiptId = `rcpt_${customerId.toString().substring(0, 8)}_${Date.now()}`;
    const razorpayOrder = await instance.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: receiptId,
      payment_capture: 1,
    });

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: totalAmount / 100,
      currency: 'INR',
      orderSummary, // send order details back to frontend
    });

  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create final DB orders after payment success
exports.createFinalOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderSummary } = req.body;
    const customerId = req.customer._id;

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Prevent duplicate orders
    const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (existingOrder) return res.status(200).json({ success: true, message: 'Order already exists' });

    // Save DB orders per shop
    const finalOrders = [];
    for (const shopOrder of orderSummary) {
      const orderProducts = shopOrder.items.map(i => ({
        product: i.productId,
        quantity: i.quantity
      }));

      const order = new Order({
        customer: customerId,
        shop: shopOrder.shopId,
        products: orderProducts,
        totalAmount: shopOrder.totalAmount,
        deliveryCharge: shopOrder.deliveryCharge,
        platformFee: shopOrder.platformFee,
        paymentMethod: 'UPI',
        paymentStatus: 'completed',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        customerLocation: {
          lat: customerLat,
          lon: customerLon,
        }
      });

      await order.save();
      finalOrders.push(order);
    }

    res.status(200).json({ success: true, message: 'Order created successfully', orders: finalOrders });

  } catch (err) {
    console.error('Final order creation failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Razorpay Webhook to update payment status
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) return res.status(400).json({ message: 'Webhook signature missing' });

    const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body);
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
    shasum.update(rawBody);
    const digest = shasum.digest('hex');

    if (digest !== signature) return res.status(400).json({ message: 'Invalid webhook signature' });

    const event = JSON.parse(rawBody);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const razorpayOrderId = event.payload.order?.entity?.id || event.payload.payment?.entity?.order_id;
      const paymentId = event.payload.payment?.entity?.id;

      const orders = await Order.find({ razorpayOrderId });
      for (let o of orders) {
        if (o.paymentStatus !== 'completed') {
          o.paymentStatus = 'completed';
          o.razorpayPaymentId = paymentId;
          await o.save();
        }
      }
    } else if (event.event === 'payment.failed') {
      console.log(`Webhook: Payment failed for Razorpay order ${event.payload.payment.entity.order_id}`);
    }

    res.json({ success: true });

  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
