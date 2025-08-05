// server/controllers/productController.js
const Product = require('../models/Product');

const Shop = require('../models/Shop');

exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      description,
      availability,
      images,
    } = req.body;

    if (!images || !images[0]) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // ✅ Get seller's shop first
    const shop = await Shop.findOne({ sellerId: req.seller });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found for this seller' });
    }

    const product = await Product.create({
      sellerId: req.seller,
      shop: shop._id, // ✅ link product to the shop
      name,
      category,
      price,
      description,
      availability,
      images,
    });

    res.status(201).json({ message: 'Product added', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.editProduct = async (req, res) => {
  try {
    // Optional: you can also validate here that `images` is valid if needed
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.seller },
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Product updated', product });
  } catch (err) {
    console.error(err);
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

// In productController.js
exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('sellerId');

    res.json(products);
  } catch (err) {
    console.error('❌ Error in getNewArrivals:', err.message, err.stack);
    res.status(500).json({ message: 'Error fetching product' });
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

exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.name); // In case of spaces
    const products = await Product.find({ category: categoryName });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching category products' });
  }
};
