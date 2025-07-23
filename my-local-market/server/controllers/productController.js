const Product = require('../models/Product');

exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, shop } = req.body;
    const imageUrl = req.file.path;

    const newProduct = new Product({
      name,
      description,
      price,
      imageUrl,
      shop,
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error in addProduct:', error);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};



exports.getProductsByShop = async (req, res) => {
  try {
    const products = await Product.find({ shop: req.params.shopId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.productId);
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true }
    );
    res.status(200).json({ message: 'Product updated', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

// PUBLIC - Get all products with optional filters
exports.getPublicProducts = async (req, res) => {
  try {
    const { category, shop } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (shop) filter.shop = shop;

    const products = await Product.find(filter).populate('shop', 'name address');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};
