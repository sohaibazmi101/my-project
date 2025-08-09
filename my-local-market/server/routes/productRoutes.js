const express = require('express');
const router = express.Router();
const sellerOrAdminAuth = require('../middleware/sellerOrAdminAuth');
const Product = require('../models/Product');

const {
  addProduct,
  editProduct,
  deleteProduct,
  getFeaturedProducts,
  searchProducts,
  getNewArrivals,
  getProductsByCategory,
  getOfferProducts,
  getAllProducts,
} = require('../controllers/productController');

const { getBanners } = require('../controllers/bannerController');
const { getCMSContent } = require('../controllers/cmsController');
const upload = require('../middleware/uploadProductImage');

// Upload product image (seller or admin)
router.post(
  '/products/upload',
  sellerOrAdminAuth,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) throw new Error('No file received from client');
      const imageUrl = req.file.path;
      res.json({ imageUrl });
    } catch (err) {
      console.error('[Upload Error]:', err);
      res.status(500).json({ message: 'Upload failed', error: err.message });
    }
  }
);

// Public product routes
router.get('/products/search', searchProducts);
router.get('/products', getAllProducts);
router.get('/products/featured', getFeaturedProducts);
router.get('/products/new-arrivals', getNewArrivals);
router.get('/products/offers', getOfferProducts);
router.get('/products/banners', getBanners);
router.get('/products/cms/:section', getCMSContent);

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name whatsapp');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('[Product Fetch Error]:', err);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

router.get('/products/category/:name', getProductsByCategory);

// Seller or admin protected routes
router.post('/products/add', sellerOrAdminAuth, addProduct);
router.put('/products/:id/edit', sellerOrAdminAuth, editProduct);
router.delete('/products/:id/delete', sellerOrAdminAuth, deleteProduct);

module.exports = router;
