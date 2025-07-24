// server/controllers/shopController.js
const Seller = require('../models/Seller');
const Product = require('../models/Product');

exports.getAllShops = async (req, res) => {
  try {
    const shops = await Seller.find().select('-password');
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getShopDetails = async (req, res) => {
  try {
    const shop = await Seller.findById(req.params.id).select('-password');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const products = await Product.find({ sellerId: req.params.id });

    res.json({ shop, products });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
