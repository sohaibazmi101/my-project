const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const verifyToken = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

// 🟢 Add a new product (with image upload)
router.post('/add', verifyToken, upload.single('image'), productController.addProduct);

// 🟢 Get products by shop
router.get('/shop/:shopId', productController.getProductsByShop);

// 🟢 Update a product
router.put('/:productId', verifyToken, productController.updateProduct);

// 🟢 Delete a product
router.delete('/:productId', verifyToken, productController.deleteProduct);

// 🟢 Get all public products
router.get('/public', productController.getPublicProducts);

module.exports = router;
