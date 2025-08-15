const Shop = require('../models/Shop');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const DeliveryBoy = require('../models/DeliveryBoy');

exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ sellerId: req.seller })
      .populate('featuredProducts newProducts')
      .populate('assignedDeliveryBoys', 'name phone email');

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

exports.getAllShopsForAdmin = async (req, res) => {
  try {
    const shops = await Shop.find();
    res.json(shops);
  } catch (err) {
    console.error('❌ getAllShopsForAdmin Error:', err.message);
    res.status(500).json({ message: 'Error fetching shops' });
  }
};

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

// Assign delivery boys to a shop (permanent)
exports.assignDeliveryBoysToShop = async (req, res) => {
  try {
    const { shopId, deliveryBoyIds } = req.body;

    // Validate input
    if (!shopId || !deliveryBoyIds || !Array.isArray(deliveryBoyIds)) {
      return res.status(400).json({ message: 'shopId and deliveryBoyIds (array) are required' });
    }

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    // Filter valid delivery boys
    const validDeliveryBoys = await DeliveryBoy.find({ _id: { $in: deliveryBoyIds } });
    if (!validDeliveryBoys.length) return res.status(404).json({ message: 'No valid delivery boys found' });

    // Add new delivery boys without duplicating
    validDeliveryBoys.forEach(db => {
      if (!shop.assignedDeliveryBoys.includes(db._id)) {
        shop.assignedDeliveryBoys.push(db._id);
      }
    });

    await shop.save();

    res.status(200).json({ message: 'Delivery boys assigned successfully', shop });
  } catch (err) {
    console.error('Assign delivery boys error:', err);
    console.log('Error in Backend: ',err)
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all delivery boys assigned to a shop
exports.getAssignedDeliveryBoys = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId).populate('assignedDeliveryBoys', 'name phone email');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    res.status(200).json({ assignedDeliveryBoys: shop.assignedDeliveryBoys });
  } catch (err) {
    console.error('Get assigned delivery boys error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.removeAssignedDeliveryBoy = async (req, res) => {
  try {
    const { shopId, deliveryBoyId } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    shop.assignedDeliveryBoys.pull(deliveryBoyId);
    await shop.save();

    res.status(200).json({ message: 'Delivery boy removed successfully', shop });
  } catch (err) {
    console.error('Remove assigned delivery boy error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
