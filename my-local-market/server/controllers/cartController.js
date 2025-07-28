const Customer = require('../models/Customer');
const Product = require('../models/Product');

// In-memory cart per customer stored in DB (you can enhance later)
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

