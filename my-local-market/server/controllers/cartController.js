const Customer = require('../models/Customer');
const Product = require('../models/Product');

// Add to cart and save in DB
exports.addToCart = async (req, res) => {
  const customerId = req.customer._id;
  const { productId, quantity } = req.body;

  if (!productId || quantity == null) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }

  const parsedQty = parseInt(quantity);
  if (isNaN(parsedQty) || parsedQty < 1) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const itemIndex = customer.cart.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      customer.cart[itemIndex].quantity += parsedQty;
    } else {
      customer.cart.push({ product: productId, quantity: parsedQty });
    }

    await customer.save();
    res.status(200).json({ message: 'Item added to cart', cart: customer.cart });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get cart
exports.getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id)
      .populate({
        path: 'cart.product',
        populate: {
          path: 'shop',
          model: 'Shop',
          select: 'name _id', // only send name and id to frontend
        },
      });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ cart: customer.cart });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.cart = customer.cart.filter(item => item.product.toString() !== productId);
    await customer.save();

    res.json({ message: 'Item removed from cart', cart: customer.cart });
  } catch (err) {
    console.error('Remove cart item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCartQty = async (req, res) => {
  const customerId = req.customer._id;
  const { productId, quantity } = req.body;

  if (!productId || quantity == null) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }

  const parsedQty = parseInt(quantity);
  if (isNaN(parsedQty) || parsedQty < 1) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const itemIndex = customer.cart.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    customer.cart[itemIndex].quantity = parsedQty;
    await customer.save();

    res.status(200).json({ message: 'Cart quantity updated', cart: customer.cart });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
