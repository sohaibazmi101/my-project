// server/routes/shopRoutes.js
const express = require('express');
const router = express.Router();
const { getAllShops, getShopDetails } = require('../controllers/shopController');

const { getCategories } = require('../controllers/categoryController');



module.exports = router;


router.get('/categories', getCategories);
router.get('/shops', getAllShops);
router.get('/shops/:id', getShopDetails);

module.exports = router;
