const express = require('express');
const router = express.Router();

// Middleware
const sellerAuth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const uploadBanner = require('../middleware/uploadBanner');

// Controllers
const {
  getAllShops,
  getMyShop,
  updateShopDetails,
  toggleFeaturedProduct,
  toggleNewProduct,
  getShopById,
  getFeaturedShops,
  updateFeaturedShops,
  getAllShopsForAdmin
} = require('../controllers/shopController');

// --- Public Routes ---
router.get('/', getAllShops);
router.get('/shops/featured', getFeaturedShops); // Featured shops
router.get('/shops/:id', getShopById);           // Get single shop by ID

// --- Seller Protected Routes ---
router.get('/seller/shop', sellerAuth, getMyShop); // Shop-only data for logged-in seller
router.put('/shops/:id/update', sellerAuth, updateShopDetails);

// Upload shop banner
router.post('/shops/banner/upload', sellerAuth, uploadBanner, (req, res) => {
  if (!req.bannerUrl) {
    return res.status(400).json({ message: 'Upload failed' });
  }
  res.json({ imageUrl: req.bannerUrl });
});

// Toggle product status
router.patch('/shops/:id/product/:productId/toggle-featured', sellerAuth, toggleFeaturedProduct);
router.patch('/shops/:id/product/:productId/toggle-new', sellerAuth, toggleNewProduct);

// --- Admin Protected Routes ---
router.get('/admin/shops/all', adminAuth, getAllShopsForAdmin);
router.post('/admin/shops/featured', adminAuth, updateFeaturedShops);

module.exports = router;
