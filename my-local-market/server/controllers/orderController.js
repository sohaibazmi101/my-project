const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Shop = require('../models/Shop');
const DeliveryBoy = require('../models/DeliveryBoy');
const crypto = require('crypto');
const { calculateOrderSummary } = require('../utils/orderUtils');

// Get all orders for a specific customer
exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const orders = await Order.find({ customer: customerId })
      .populate('shop', 'name')
      .populate('products.product', 'name price');
    res.json(orders);
  } catch (err) {
    console.error('Failed to get orders:', err);
    res.status(500).json({ message: 'Error retrieving orders' });
  }
};

// Calculate order summary (replaces old calculateOrder)
exports.calculateOrder = async (req, res) => {
  try {
    console.log("===== /calculate-order request received =====");
    console.log("Request body:", req.body);
    const { cart, productId, quantity, customerLat, customerLon } = req.body;

    if ((!cart || cart.length === 0) && !productId) {
      return res.status(400).json({ message: 'No products provided' });
    }

    if (typeof customerLat !== 'number' || typeof customerLon !== 'number') {
      return res.status(400).json({ message: 'Customer coordinates required' });
    }

    const orderSummary = await calculateOrderSummary({ cart, productId, quantity, customerLat, customerLon });
    res.json({ orderSummary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to calculate order' });
  }
};

// Place order (COD or Razorpay)
exports.placeOrder = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const { cart, shippingAddress, customerInfo, paymentMethod, customerLat, customerLon, frontendTotal } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or invalid' });
    }
    if (!shippingAddress || !customerInfo) {
      return res.status(400).json({ message: 'Shipping address and customer info required' });
    }
    if (!paymentMethod || !['Cash on Delivery', 'UPI'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Valid payment method required' });
    }
    if (typeof customerLat !== 'number' || typeof customerLon !== 'number') {
      return res.status(400).json({ message: 'Customer latitude and longitude required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Use orderUtils to calculate summary
    const orderSummary = await calculateOrderSummary({ cart, customerLat, customerLon });
    if (!orderSummary || orderSummary.length === 0) {
      return res.status(400).json({ message: 'Unable to calculate order summary' });
    }

    // Compare frontend total if provided
    const backendTotal = orderSummary.reduce((sum, shopOrder) => sum + shopOrder.totalAmount, 0);
    if (frontendTotal && Math.abs(frontendTotal - backendTotal) > 0.01) {
      return res.status(400).json({ message: 'Price mismatch. Please refresh and try again.' });
    }

    // Save orders in DB grouped by shop
    const createdOrders = [];
    for (const shopOrder of orderSummary) {
      const orderProducts = shopOrder.items.map(i => ({
        product: i.productId,
        quantity: i.quantity,
      }));

      const order = new Order({
        customer: customerId,
        shop: shopOrder.shopId,
        products: orderProducts,
        totalAmount: shopOrder.totalAmount,
        deliveryCharge: shopOrder.deliveryCharge,
        platformFee: shopOrder.platformFee,
        paymentMethod,
        paymentStatus: paymentMethod === 'UPI' ? 'pending' : 'pending',
        customerLat,
        customerLon,
      });

      await order.save();
      createdOrders.push(order);
    }

    res.status(201).json(createdOrders);
  } catch (err) {
    console.error('Order placement failed:', err);
    res.status(500).json({ message: 'Order placement failed' });
  }
};

// Get all orders for admin
exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('shop', 'name shopCode')
      .populate('products.product', 'name price productCode');
    res.status(200).json(orders);
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders for seller
exports.getSellerOrders = async (req, res) => {
  const sellerId = req.seller;
  try {
    const sellerShops = await Shop.find({ sellerId }).select('_id');
    const shopIds = sellerShops.map(shop => shop._id);

    const orders = await Order.find({ shop: { $in: shopIds } })
      .populate('customer', 'name email')
      .populate('products.product', 'name price shop');

    res.status(200).json(orders);
  } catch (err) {
    console.error('Get seller orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const sellerId = req.seller;
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid order status.' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const shop = await Shop.findOne({ _id: order.shop, sellerId });
    if (!shop) return res.status(403).json({ message: 'Unauthorized to update this order.' });

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated successfully.', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Shop owner assigns delivery boys to an order
exports.assignDeliveryBoys = async (req, res) => {
    const { orderId } = req.params;
    const { deliveryBoyIds } = req.body; // array of delivery boy IDs

    if (!Array.isArray(deliveryBoyIds) || deliveryBoyIds.length === 0) {
        return res.status(400).json({ message: 'Provide at least one delivery boy ID' });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Verify that the delivery boys exist
        const validDeliveryBoys = await DeliveryBoy.find({ _id: { $in: deliveryBoyIds } });
        if (validDeliveryBoys.length !== deliveryBoyIds.length) {
            return res.status(400).json({ message: 'Some delivery boys are invalid' });
        }

        order.deliveryBoys = deliveryBoyIds;
        await order.save();

        res.json({ message: 'Delivery boys assigned successfully', order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAvailableOrdersForDeliveryBoy = async (req, res) => {
    const deliveryBoyId = req.deliveryBoy._id; // assume authenticated delivery boy
    try {
        const orders = await Order.find({
            deliveryBoys: deliveryBoyId,
            status: { $in: ['Pending', 'Processing', 'Shipped'] },
            assignedDeliveryBoy: null, // only unassigned orders
        })
        .populate('customer', 'name phone address latitude longitude')
        .populate('shop', 'name');

        res.json({ orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.pickOrder = async (req, res) => {
    const deliveryBoyId = req.deliveryBoy._id;
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!order.deliveryBoys.includes(deliveryBoyId)) {
            return res.status(403).json({ message: 'You are not assigned to this order' });
        }
        if (order.assignedDeliveryBoy) {
            return res.status(400).json({ message: 'Order already picked by another delivery boy' });
        }

        const secretCode = Math.floor(100000 + Math.random() * 900000).toString();

        order.assignedDeliveryBoy = deliveryBoyId;
        order.secretCode = secretCode;
        order.status = 'Processing'; // update status
        await order.save();

        res.json({ message: 'Order picked successfully', order, secretCode });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update order status and optionally payment status
exports.updateOrderStatus = async (req, res) => {
    const deliveryBoyId = req.deliveryBoy._id;
    const { orderId } = req.params;
    const { status, paymentStatus, secretCode } = req.body;

    try {
        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.assignedDeliveryBoy.toString() !== deliveryBoyId.toString()) {
            return res.status(403).json({ message: 'You are not assigned to this order' });
        }
        if (order.secretCode !== secretCode) {
            return res.status(400).json({ message: 'Invalid secret code' });
        }

        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();
        res.json({ message: 'Order updated successfully', order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
