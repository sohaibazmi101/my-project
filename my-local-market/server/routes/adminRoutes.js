const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { loginAdmin } = require('../controllers/adminController');

const {
  addCategory,
  getCategories,
  deleteCategory
} = require('../controllers/categoryController');

const { getAllProducts, toggleFeatured } = require('../controllers/productController');
const { getBanners, addBanner, deleteBanner } = require('../controllers/bannerController');
const { getCMSContent, updateCMSContent } = require('../controllers/cmsController');

// ✅ Use Cloudinary uploader middleware
const uploadBanner = require('../middleware/uploadBanner');

// Admin login
router.post('/login', loginAdmin);

// Category routes
router.post('/categories', adminAuth, addCategory);
router.get('/categories', adminAuth, getCategories);
router.delete('/categories/:id', adminAuth, deleteCategory);

// Product routes
router.get('/products', adminAuth, getAllProducts);
router.patch('/products/:id/featured', adminAuth, toggleFeatured);

// ✅ Upload banner to Cloudinary
router.post('/banners/upload', adminAuth, uploadBanner, (req, res) => {
  if (!req.bannerUrl) {
    return res.status(400).json({ message: 'Banner upload failed' });
  }
  res.status(200).json({ imageUrl: req.bannerUrl });
});

// Banner DB operations
router.get('/banners', adminAuth, getBanners);
router.post('/banners', adminAuth, addBanner);
router.delete('/banners/:id', adminAuth, deleteBanner);

// CMS
router.get('/cms/:section', adminAuth, getCMSContent);
router.post('/cms/:section', adminAuth, updateCMSContent);

module.exports = router;
