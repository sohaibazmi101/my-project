const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const orders = await Order.find({ customer: customerId }).populate('products.product').populate('shop');
    res.json(orders);
  } catch (err) {
    console.error('Failed to get orders:', err);
    res.status(500).json({ message: 'Error retrieving orders' });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const cart = req.body.cart; // Expected: [{ product: id, quantity: n }]

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or invalid' });
    }

    // Group products by shop
    const shopGroups = {};
    for (const item of cart) {
      const product = await Product.findById(item.product).populate('shop');
      if (!product) continue;

      const shopId = product.shop._id.toString();
      if (!shopGroups[shopId]) shopGroups[shopId] = { shop: product.shop, items: [] };

      shopGroups[shopId].items.push({ product, quantity: item.quantity });
    }

    // Create orders per shop
    const createdOrders = [];

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
