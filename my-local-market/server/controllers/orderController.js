const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Shop = require('../models/Shop');
const DeliveryBoy = require('../models/DeliveryBoy');
const crypto = require('crypto');
const { calculateOrderSummary } = require('../utils/orderUtils');

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

exports.calculateOrder = async (req, res) => {
  try {
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
    const orderSummary = await calculateOrderSummary({ cart, customerLat, customerLon });
    if (!orderSummary || orderSummary.length === 0) {
      return res.status(400).json({ message: 'Unable to calculate order summary' });
    }
    const backendTotal = orderSummary.reduce((sum, shopOrder) => sum + shopOrder.totalAmount, 0);
    if (frontendTotal && Math.abs(frontendTotal - backendTotal) > 0.01) {
      return res.status(400).json({ message: 'Price mismatch. Please refresh and try again.' });
    }
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
        customerLocation: {
          lat: customerLat,
          lon: customerLon,
        }
      });
      await order.save();
      createdOrders.push(order);
      const customerMobile = customerInfo.phone || customer.phone;
      const message = `Hello ${customerInfo.name || 'Customer'},
       your order ${order.orderNumber} has been placed successfully.
        Total: ₹${order.totalAmount.toFixed(2)}.`;
    }
    res.status(201).json(createdOrders);
  } catch (err) {
    console.error('Order placement failed:', err);
    res.status(500).json({ message: 'Order placement failed' });
  }
};

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

exports.updateOrderStatus = async (req, res) => {
  try {
    const sellerId = req.seller;
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'PickedUp', 'Delivered', 'Cancelled'];
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

exports.getAvailableOrdersForDeliveryBoy = async (req, res) => {
  const deliveryBoyId = req.deliveryBoy._id;
  try {
    const shops = await Shop.find({ assignedDeliveryBoys: deliveryBoyId }).select('_id');
    const shopIds = shops.map(shop => shop._id);
    const orders = await Order.find({
      shop: { $in: shopIds },
      status: 'Pending',
      assignedDeliveryBoy: null
    })
      .populate('customer', 'name phone address')
      .populate('shop', 'name');
    res.json({ orders });
  } catch (err) {
    console.error('Error fetching available orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.pickOrder = async (req, res) => {
  const deliveryBoyId = req.deliveryBoy._id;
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId).populate('shop', 'assignedDeliveryBoys name');
    if (!order) {
      console.warn(`Order not found: ${orderId}`);
      return res.status(404).json({ message: 'Order not found' });
    }
    const isAssignedToShop = order.shop.assignedDeliveryBoys.some(
      (id) => id.equals(deliveryBoyId)
    );
    if (!isAssignedToShop) {
      console.warn(`Delivery boy ${deliveryBoyId} not assigned to shop ${order.shop.name}`);
      return res.status(403).json({ message: 'You are not assigned to this shop' });
    }
    if (order.assignedDeliveryBoy) {
      console.warn(`Order ${orderId} already picked by ${order.assignedDeliveryBoy}`);
      return res.status(400).json({ message: 'Order already picked by another delivery boy' });
    }
    order.assignedDeliveryBoy = deliveryBoyId;
    order.status = 'PickedUp';
    await order.save();
    res.json({ message: 'Order picked successfully', order });
  } catch (err) {
    console.error('Error picking order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPickedOrders = async (req, res) => {
  const deliveryBoyId = req.deliveryBoy._id;
  try {
    const orders = await Order.find({
      assignedDeliveryBoy: deliveryBoyId,
      status: 'PickedUp'
    })
      .populate('shop', 'name')
      .populate('customer', 'name phone address');

    res.json({ orders });
  } catch (err) {
    console.error('Error fetching picked orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderStatusByDeliveryBoy = async (req, res) => {
  const deliveryBoyId = req.deliveryBoy._id;
  const { orderId } = req.params;
  const { action, secretCode } = req.body;
  if (!['Delivered', 'Cancelled'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.assignedDeliveryBoy || !order.assignedDeliveryBoy.equals(deliveryBoyId)) {
      return res.status(403).json({ message: 'You are not assigned to this order' });
    }
    if (order.secretCode !== secretCode) {
      return res.status(400).json({ message: 'Invalid secret code' });
    }
    if (order.status !== 'PickedUp') {
      return res.status(400).json({ message: 'Order cannot be updated' });
    }
    order.status = action;
    if (action === 'Delivered' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'success';
    } else if (action === 'Cancelled') {
      order.paymentStatus = 'failed';
    }
    await order.save();
    res.json({ message: `Order ${action} successfully`, order });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
