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
  getAllShopsForAdmin,
  assignDeliveryBoysToShop,
  getAssignedDeliveryBoys,
  removeAssignedDeliveryBoy,
} = require('../controllers/shopController');
router.get('/', getAllShops);
router.get('/shops/featured', getFeaturedShops);
router.get('/shops/:id', getShopById);
router.get('/seller/shop', sellerAuth, getMyShop);
router.put('/shops/:id/update', sellerAuth, updateShopDetails);
router.post('/shops/banner/upload', sellerAuth, uploadBanner, (req, res) => {
  if (!req.bannerUrl) {
    return res.status(400).json({ message: 'Upload failed' });
  }
  res.json({ imageUrl: req.bannerUrl });
});
router.post('/assign-db', sellerAuth, assignDeliveryBoysToShop);
router.get('/:shopId/delivery-boys', sellerAuth, getAssignedDeliveryBoys);
router.post('/remove-assigned-db',sellerAuth, removeAssignedDeliveryBoy);
router.patch('/shops/:id/product/:productId/toggle-featured', sellerAuth, toggleFeaturedProduct);
router.patch('/shops/:id/product/:productId/toggle-new', sellerAuth, toggleNewProduct);
router.get('/admin/shops/all', adminAuth, getAllShopsForAdmin);
router.post('/admin/shops/featured', adminAuth, updateFeaturedShops);

module.exports = router;
