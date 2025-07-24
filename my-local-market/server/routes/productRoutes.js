// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  addProduct,
  editProduct,
  deleteProduct
} = require('../controllers/productController');

router.post('/products/add', auth, addProduct);
router.put('/products/:id/edit', auth, editProduct);
router.delete('/products/:id/delete', auth, deleteProduct);

module.exports = router;
