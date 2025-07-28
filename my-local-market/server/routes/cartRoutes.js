// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const verifyCustomer = require('../middleware/verifyCustomer');

let cartStore = {}; // Temporary in-memory cart, per customer

router.post('/add', verifyCustomer, (req, res) => {
  const customerId = req.customer._id;
  const { product, quantity } = req.body;

  if (!product || !quantity) {
    return res.status(400).json({ message: 'Product and quantity required' });
  }

  if (!cartStore[customerId]) {
    cartStore[customerId] = [];
  }

  cartStore[customerId].push({ product, quantity });
  res.json({ message: 'Added to cart', cart: cartStore[customerId] });
});

module.exports = router;
