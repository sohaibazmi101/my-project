const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Product = require('../models/Product');

const {
  addProduct,
  editProduct,
  deleteProduct,
  getFeaturedProducts,
  searchProducts
} = require('../controllers/productController');

const { getBanners } = require('../controllers/bannerController');
const { getCMSContent } = require('../controllers/cmsController');
const upload = require('../middleware/uploadProductImage');

router.post('/products/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file received from client');
    const imageUrl = req.file.path;
    res.json({ imageUrl });
  } catch (err) {
    console.error('[Upload Error]:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});



// 🔍 Search products
router.get('/products/search', searchProducts);

// 🌟 Featured products
router.get('/products/featured', getFeaturedProducts);

// 🖼️ Banners
router.get('/products/banners', getBanners);

// 📄 CMS content
router.get('/products/cms/:section', getCMSContent);

// 📦 Single product by ID
// 📦 Single product by ID with seller info (for WhatsApp button)
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name whatsapp'); // 👈 This populates WhatsApp number

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    console.error('[Product Fetch Error]:', err);
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
