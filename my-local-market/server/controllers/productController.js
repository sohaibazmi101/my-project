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
