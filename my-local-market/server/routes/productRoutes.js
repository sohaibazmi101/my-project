// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  addProduct,
  editProduct,
  deleteProduct
} = require('../controllers/productController');

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});


const { getFeaturedProducts } = require('../controllers/productController');

const { searchProducts } = require('../controllers/productController');
router.get('/search', searchProducts);


router.post('/products/add', auth, addProduct);
router.put('/products/:id/edit', auth, editProduct);
router.delete('/products/:id/delete', auth, deleteProduct);
router.get('/featured', getFeaturedProducts);
router.get('/banners', getBanners);
router.get('/cms/:section', getCMSContent);


module.exports = router;
