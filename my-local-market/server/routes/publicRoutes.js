const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categoryController');

// ✅ Public category fetch
router.get('/categories', getCategories);

module.exports = router;
