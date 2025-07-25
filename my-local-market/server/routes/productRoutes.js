const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Product = require('../models/Product');

const {
  addProduct,
  editProduct,
  deleteProduct,
  getFeaturedProducts,
  searchProducts,
  getBanners,
  getCMSContent
} = require('../controllers/productController');

// 🔍 Search products (e.g. /products/search?q=milk)
router.get('/products/search', searchProducts);

// 🌟 Get featured products
router.get('/products/featured', getFeaturedProducts);

// 🖼️ Get banners
router.get('/products/banners', getBanners);

// 📄 Get CMS content by section (e.g. /products/cms/home)
router.get('/products/cms/:section', getCMSContent);

// 📦 Get single product by ID (e.g. /products/12345)
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// ➕ Add product
router.post('/products/add', auth, addProduct);

// ✏️ Edit product
router.put('/products/:id/edit', auth, editProduct);

// ❌ Delete product
router.delete('/products/:id/delete', auth, deleteProduct);

module.exports = router;
