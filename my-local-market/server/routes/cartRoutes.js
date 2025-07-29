const express = require('express');
const router = express.Router();
const verifyCustomer = require('../middleware/verifyCustomer');
const Product = require('../models/Product');

let cartStore = {}; // In-memory per-customer cart

// Add to cart
router.post('/add', verifyCustomer, async (req, res) => {
  const customerId = req.customer._id;
  const { productId, quantity } = req.body;

  if (!productId || quantity == null) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (!cartStore[customerId]) {
      cartStore[customerId] = [];
    }

    const existingIndex = cartStore[customerId].findIndex(
      item => item.product._id.toString() === productId
    );

    if (existingIndex > -1) {
      cartStore[customerId][existingIndex].quantity += parseInt(quantity);
    } else {
      cartStore[customerId].push({
        product,
        quantity: parseInt(quantity),
      });
    }

    res.status(200).json({ message: 'Added to cart', cart: cartStore[customerId] });
  } catch (err) {
    console.error('Cart Add Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET current cart
router.get('/', verifyCustomer, (req, res) => {
  const customerId = req.customer._id;
  const cart = cartStore[customerId] || [];
  res.json({ cart });
  console.log('From Route : ',customerId, cart)
});

module.exports = router;
