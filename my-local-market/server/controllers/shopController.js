const Shop = require('../models/Shop');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ sellerId: req.seller })
      .populate('featuredProducts newProducts');

    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const products = await Product.find({ sellerId: req.seller });

    res.json({ shop, products }); // ✅ frontend expects this format
  } catch (err) {
    console.error('❌ getMyShop Error:', err.message);
    res.status(500).json({ message: 'Error getting shop' });
  }
};

exports.updateShopDetails = async (req, res) => {
  try {
    const { description, banner, name } = req.body;

    const updated = await Shop.findOneAndUpdate(
      { sellerId: req.seller },
      { $set: { description, banner, name } },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('❌ updateShopDetails Error:', err.message);
    res.status(500).json({ message: 'Error updating shop' });
  }
};

exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().select('-__v').lean(); // optional: clean response
    res.json(shops);
  } catch (err) {
    console.error('❌ getAllShops Error:', err.message);
    res.status(500).json({ message: 'Error fetching shops' });
  }
};

exports.getShopById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid shop ID' });
    }

    const shop = await Shop.findById(id)
      .populate('featuredProducts newProducts')
      .lean();

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const products = await Product.find({ shop: id });

    res.json({ shop, products });
  } catch (err) {
    console.error('❌ getShopById Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


const toggleProductField = async (req, res, fieldName) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const shop = await Shop.findOne({ sellerId: req.seller });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const exists = shop[fieldName].includes(productId);
    if (exists) {
      shop[fieldName].pull(productId);
    } else {
      shop[fieldName].push(productId);
    }

    await shop.save();

    res.json({
      message: exists
        ? `Removed from ${fieldName}`
        : `Added to ${fieldName}`,
    });
  } catch (err) {
    console.error(`❌ toggle ${fieldName} Error:`, err.message);
    res.status(500).json({ message: `Error toggling ${fieldName}` });
  }
};

exports.toggleFeaturedProduct = (req, res) => {
  toggleProductField(req, res, 'featuredProducts');
};

exports.toggleNewProduct = (req, res) => {
  toggleProductField(req, res, 'newProducts');
};
