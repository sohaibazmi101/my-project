// src/controllers/orderController.js

const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Shop = require('../models/Shop');

/**
 * @desc Get all orders for a specific customer
 * @route GET /api/customers/orders
 * @access Private/Customer
 */
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

/**
 * @desc Place an order from the customer's cart
 * @route POST /api/customers/orders
 * @access Private/Customer
 */
exports.placeOrder = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const { cart, shippingAddress, customerInfo } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or invalid' });
    }
    if (!shippingAddress || !customerInfo) {
      return res.status(400).json({ message: 'Shipping address and customer info required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const productIds = cart.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).populate('shop');
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // Group items by shop
    const shopGroups = {};
    const orderedProductIds = new Set();
    for (const item of cart) {
      const product = productMap.get(item.product);
      if (!product) continue;
      const shopId = product.shop._id.toString();
      if (!shopGroups[shopId]) {
        shopGroups[shopId] = {
          shop: product.shop,
          items: [],
          paymentMethod: item.paymentMethod,
        };
      }
      shopGroups[shopId].items.push({ product, quantity: item.quantity });
      orderedProductIds.add(item.product.toString());
    }

    const createdOrders = [];
    for (const shopId in shopGroups) {
      const { shop, items, paymentMethod } = shopGroups[shopId];
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
        paymentMethod,
        shippingAddress,
        customerInfo,
      });

      // Mongoose's pre-save hook will automatically generate the unique orderNumber here
      await order.save();
      createdOrders.push(order);
    }

    // Remove ordered products from customer cart
    customer.cart = customer.cart.filter(item => !orderedProductIds.has(item.product.toString()));
    await customer.save();

    res.status(201).json(createdOrders);
  } catch (err) {
    console.error('Order placement failed:', err);
    res.status(500).json({ message: 'Order placement failed' });
  }
};

/**
 * @desc Get all orders for the admin dashboard
 * @route GET /api/admin/orders
 * @access Private/Admin
 */
exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('shop', 'name')
      .populate('products.product', 'name price');
    res.status(200).json(orders);
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Get orders for a specific seller dashboard
 * @route GET /api/seller/orders
 * @access Private/Seller
 */

exports.getSellerOrders = async (req, res) => {
  const sellerId = req.seller._id;

  try {
    const sellerShops = await Shop.find({ sellerId: sellerId }).select('_id');
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
