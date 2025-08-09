const express = require('express');
const router = express.Router();
const { getTopCategoriesWithProducts } = require('../controllers/categoryController');

router.get('/top-with-products', getTopCategoriesWithProducts);

module.exports = router;