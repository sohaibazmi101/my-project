const Customer = require('../models/Customer');
const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
  try {
    console.log("\n=== ADD TO CART DEBUG ===");
    console.log("Customer from token:", req.customer ? req.customer._id : null);
    console.log("Request body:", req.body);

    const { productId, quantity } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log("❌ Product not found:", productId);
      return res.status(404).json({ message: 'Product not found' });
    }

    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      console.log("❌ Customer not found in DB:", req.customer._id);
      return res.status(404).json({ message: 'Customer not found' });
    }

    console.log("Current cart before add:", JSON.stringify(customer.cart, null, 2));

    const pid = productId.toString();
    const existingItemIndex = customer.cart.findIndex(
      item => item.product.toString() === pid
    );

    if (existingItemIndex > -1) {
      customer.cart[existingItemIndex].quantity += quantity;
      console.log(`✅ Updated quantity for product ${pid}`);
    } else {
      customer.cart.push({ product: product._id, quantity });
      console.log(`✅ Added new product ${pid} to cart`);
    }

    await customer.save();
    console.log("Cart after save:", JSON.stringify(customer.cart, null, 2));

    res.json({ message: 'Cart updated successfully', cart: customer.cart });
  } catch (error) {
    console.error("❌ Error in addToCart:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCart = async (req, res) => {
  try {
    console.log("\n=== GET CART DEBUG ===");
    console.log("Customer from token:", req.customer ? req.customer._id : null);

    const customer = await Customer.findById(req.customer._id)
      .populate({
        path: 'cart.product',
        populate: { path: 'shop' }
      });

    if (!customer) {
      console.log("❌ Customer not found in DB:", req.customer._id);
      return res.status(404).json({ message: 'Customer not found' });
    }

    console.log("Cart length from DB:", customer.cart.length);
    console.log("Cart content from DB:", JSON.stringify(customer.cart, null, 2));

    res.json(customer.cart);
  } catch (error) {
    console.error("❌ Error in getCart:", error);
    res.status(500).json({ message: 'Server error' });
  }
};


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
