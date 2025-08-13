const Shop = require('../models/Shop');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ sellerId: req.seller })
      .populate('featuredProducts newProducts');

    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const products = await Product.find({ sellerId: req.seller });

    res.json({ shop, products });
  } catch (err) {
    console.error('❌ getMyShop Error:', err.message);
    res.status(500).json({ message: 'Error getting shop' });
  }
};

exports.updateShopDetails = async (req, res) => {
  try {
    const { description, banner, name, latitude, longitude } = req.body;

    const updated = await Shop.findOneAndUpdate(
      { sellerId: req.seller },
      { $set: { description, banner, name, latitude, longitude } },
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
    const shops = await Shop.find().select('-__v').lean();
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

// --- NEW FUNCTIONS FOR TOP SELLERS ---

/**
 * @description Get a list of all shops for the admin dashboard.
 * This is a duplicate of exports.getAllShops but kept separate for clarity on routes.
 */
exports.getAllShopsForAdmin = async (req, res) => {
  try {
    const shops = await Shop.find();
    res.json(shops);
  } catch (err) {
    console.error('❌ getAllShopsForAdmin Error:', err.message);
    res.status(500).json({ message: 'Error fetching shops' });
  }
};

/**
 * @description Get all shops with a featuredPosition, sorted by position.
 */
exports.getFeaturedShops = async (req, res) => {
  try {
    const shops = await Shop.find({ featuredPosition: { $exists: true } })
      .sort({ featuredPosition: 1 });
    res.json(shops);
  } catch (err) {
    console.error('❌ getFeaturedShops Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @description Update the featured shops list based on an ordered array of IDs.
 * This function is for admins only.
 */
exports.updateFeaturedShops = async (req, res) => {
  try {
    const featuredShopIds = req.body.featuredShopIds; // Expects an array of shop IDs

    // Clear all existing featured positions
    await Shop.updateMany({}, { $unset: { featuredPosition: "" } });

    // Set new featured positions based on the ordered array
    for (let i = 0; i < featuredShopIds.length; i++) {
      await Shop.findByIdAndUpdate(featuredShopIds[i], { featuredPosition: i + 1 });
    }
    
    res.json({ message: 'Featured shops updated successfully' });
  } catch (err) {
    console.error('❌ updateFeaturedShops Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};