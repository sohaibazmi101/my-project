const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const uploadBanner = require('../middleware/uploadBanner');

const {
  getMyShop,
  updateShopDetails,
  toggleFeaturedProduct,
  toggleNewProduct,
} = require('../controllers/shopController');

// 🛡 Protected routes
router.get('/seller/shop', auth, getMyShop);
router.put('/shops/:id/update', auth, updateShopDetails);

router.post('/shops/banner/upload', auth, uploadBanner.single('banner'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ imageUrl: `/uploads/banners/${req.file.filename}` });
});

router.patch('/shops/:id/product/:productId/toggle-featured', auth, toggleFeaturedProduct);
router.patch('/shops/:id/product/:productId/toggle-new', auth, toggleNewProduct);

module.exports = router;
