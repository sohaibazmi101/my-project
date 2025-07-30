const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const uploadBanner = require('../middleware/uploadBanner');

const {
  getAllShops,
  getMyShop,
  updateShopDetails,
  toggleFeaturedProduct,
  toggleNewProduct,
  getShopById,
} = require('../controllers/shopController');

router.get('/', getAllShops);

router.get('/shops/:id', getShopById);

router.get('/seller/shop', auth, getMyShop);
router.put('/shops/:id/update', auth, updateShopDetails);

router.post('/shops/banner/upload', auth, uploadBanner, (req, res) => {
  if (!req.bannerUrl) {
    return res.status(400).json({ message: 'Upload failed' });
  }
  res.json({ imageUrl: req.bannerUrl });
});

router.patch('/shops/:id/product/:productId/toggle-featured', auth, toggleFeaturedProduct);
router.patch('/shops/:id/product/:productId/toggle-new', auth, toggleNewProduct);

module.exports = router;
