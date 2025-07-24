// server/routes/shopRoutes.js
const express = require('express');
const router = express.Router();
const { getAllShops, getShopDetails } = require('../controllers/shopController');

router.get('/shops', getAllShops);
router.get('/shops/:id', getShopDetails);

module.exports = router;
