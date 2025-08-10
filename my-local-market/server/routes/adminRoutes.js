const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// Controllers
const { loginAdmin } = require('../controllers/adminController');
const {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategoryRank
} = require('../controllers/categoryController');
const { getAllProducts, toggleFeatured } = require('../controllers/productController');
const { getBanners, addBanner, deleteBanner } = require('../controllers/bannerController');
const { getCMSContent, updateCMSContent } = require('../controllers/cmsController');
const { getAllOrdersForAdmin } = require('../controllers/orderController'); // New import

// Upload middlewares
const uploadBanner = require('../middleware/uploadBanner');
const uploadCategoryImage = require('../middleware/uploadCategoryImage');

// Admin login
router.post('/login', loginAdmin);

// Category routes
router.post('/categories', adminAuth, addCategory);
router.get('/categories', adminAuth, getCategories);
router.delete('/categories/:id', adminAuth, deleteCategory);
router.patch('/categories/:id/move', adminAuth, updateCategoryRank);

// Category image upload
router.post('/categories/upload', adminAuth, uploadCategoryImage, (req, res) => {
  if (!req.categoryImageUrl) {
    return res.status(400).json({ message: 'Upload failed' });
  }
  res.status(200).json({ imageUrl: req.categoryImageUrl });
});

// Product routes
router.get('/products', adminAuth, getAllProducts);
router.patch('/products/:id/featured', adminAuth, toggleFeatured);

// Banner image upload
router.post('/banners/upload', adminAuth, uploadBanner, (req, res) => {
  if (!req.bannerUrl) {
    return res.status(400).json({ message: 'Banner upload failed' });
  }
  res.status(200).json({ imageUrl: req.bannerUrl });
});

// Banner routes
router.get('/banners', adminAuth, getBanners);
router.post('/banners', adminAuth, addBanner);
router.delete('/banners/:id', adminAuth, deleteBanner);

// CMS routes
router.get('/cms/:section', adminAuth, getCMSContent);
router.post('/cms/:section', adminAuth, updateCMSContent);

// Order routes
router.get('/orders', adminAuth, getAllOrdersForAdmin); // New route for getting all orders

module.exports = router;