const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Shop = require('../models/Shop');

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

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
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

    let items = [];
    if (cart && cart.length > 0) {
      const productIds = cart.map(i => i.product);
      const products = await Product.find({ _id: { $in: productIds } }).populate('shop');
      const productMap = new Map(products.map(p => [p._id.toString(), p]));
      for (const i of cart) {
        const product = productMap.get(i.product);
        if (product) items.push({ product, quantity: i.quantity });
      }
    } else {
      const product = await Product.findById(productId).populate('shop');
      if (!product) return res.status(404).json({ message: 'Product not found' });
      items.push({ product, quantity });
    }

    const shopGroups = {};
    for (const item of items) {
      const shopId = item.product.shop._id.toString();
      if (!shopGroups[shopId]) shopGroups[shopId] = { shop: item.product.shop, items: [] };
      shopGroups[shopId].items.push(item);
    }

    const orderSummary = [];

    for (const shopId in shopGroups) {
      const { shop, items } = shopGroups[shopId];

      const dist = haversineDistance(customerLat, customerLon, shop.latitude, shop.longitude);

      if (dist > 15) {
        return res.status(400).json({
          message: `Distance from shop ${shop.name} is ${dist.toFixed(2)} km, beyond delivery range.`,
        });
      }

      const itemsTotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      const deliveryCharge = dist * 10; // ₹10 per km
      const platformFee = itemsTotal * 0.05; // 5%
      const totalAmount = itemsTotal + deliveryCharge + platformFee;

      orderSummary.push({
        shopId,
        shopName: shop.name,
        items: items.map(i => ({
          productId: i.product._id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          subtotal: i.product.price * i.quantity,
        })),
        distance: dist,
        deliveryCharge,
        platformFee,
        totalAmount,
      });
    }

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
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const productIds = cart.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).populate('shop');
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    const shopGroups = {};

    // Group products by shop
    for (const item of cart) {
      const product = productMap.get(item.product);
      if (!product) continue;

      const shopId = product.shop._id.toString();
      if (!shopGroups[shopId]) {
        shopGroups[shopId] = {
          shop: product.shop,
          items: [],
        };
      }
      shopGroups[shopId].items.push({ product, quantity: item.quantity });
    }

    const createdOrders = [];
    let backendTotal = 0;

    for (const shopId in shopGroups) {
      const { shop, items } = shopGroups[shopId];
      const dist = haversineDistance(customerLat, customerLon, shop.latitude, shop.longitude);

      if (dist > 15) {
        return res.status(400).json({
          message: `Distance from shop ${shop.name} is ${dist.toFixed(2)} km, which is beyond delivery range.`,
        });
      }

      const itemsTotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      const deliveryCharge = dist * 10; // ₹10 per km
      const subTotal = itemsTotal + deliveryCharge;
      const platformFee = subTotal * 0.05; // 5%
      const totalAmount = itemsTotal + deliveryCharge + platformFee;

      backendTotal += totalAmount;

      const orderProducts = items.map(i => ({
        product: i.product._id,
        quantity: i.quantity,
      }));

      const order = new Order({
        customer: customerId,
        shop: shop._id,
        products: orderProducts,
        totalAmount,
        deliveryCharge,
        platformFee,
        paymentMethod,
        paymentStatus: 'pending',
        customerLat,
        customerLon,
      });

      await order.save();
      createdOrders.push(order);
    }

    if (frontendTotal && Math.abs(frontendTotal - backendTotal) > 0.01) {
      return res.status(400).json({
        message: 'Price mismatch. Please refresh and try again.',
      });
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

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const shop = await Shop.findOne({ _id: order.shop, sellerId });
    if (!shop) {
      return res.status(403).json({ message: 'Unauthorized to update this order.' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated successfully.', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
