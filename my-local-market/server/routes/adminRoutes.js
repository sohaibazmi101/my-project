const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { loginAdmin } = require('../controllers/adminController'); // ← make sure this exists

// Admin login route
router.post('/login', loginAdmin);

const {
  addCategory,
  getCategories,
  deleteCategory
} = require('../controllers/categoryController');

// Admin-only category management
router.post('/categories', adminAuth, addCategory);
router.get('/categories', adminAuth, getCategories);
router.delete('/categories/:id', adminAuth, deleteCategory);

const { getAllProducts, toggleFeatured } = require('../controllers/productController');

router.get('/products', adminAuth, getAllProducts);
router.patch('/products/:id/featured', adminAuth, toggleFeatured);

const { getBanners, addBanner, deleteBanner } = require('../controllers/bannerController');

const upload = require('../middleware/uploadBanner');

router.post('/banners/upload', adminAuth, upload.single('banner'), async (req, res) => {
  const imageUrl = req.file.path; // Cloudinary gives back URL
  res.status(200).json({ imageUrl });
});


router.get('/banners', adminAuth, getBanners);
router.post('/banners', adminAuth, addBanner);
router.delete('/banners/:id', adminAuth, deleteBanner);

const { getCMSContent, updateCMSContent } = require('../controllers/cmsController');

router.get('/cms/:section', adminAuth, getCMSContent);
router.post('/cms/:section', adminAuth, updateCMSContent);

module.exports = router;
