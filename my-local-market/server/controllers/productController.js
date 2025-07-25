// server/controllers/productController.js
const Product = require('../models/Product');

exports.addProduct = async (req, res) => {
  try {
    const { name, category, price, description, availability, imageUrl } = req.body;

    const product = await Product.create({
      sellerId: req.seller,
      name,
      category,
      price,
      description,
      availability,
      imageUrl
    });

    res.status(201).json({ message: 'Product added', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.seller },
      req.body,
      { new: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });

    res.json({ message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.seller });
    if (!result) return res.status(404).json({ message: 'Product not found or unauthorized' });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all products (admin only)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('sellerId', 'name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.featured = !product.featured;
    await product.save();

    res.json({ message: 'Updated', featured: product.featured });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(6);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchProducts = async (req, res) => {
  const q = req.query.q;
  const regex = new RegExp(q, 'i');
  try {
    const products = await Product.find({ name: regex });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Search failed' });
  }
};
