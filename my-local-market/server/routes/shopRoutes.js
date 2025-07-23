const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { addShop, getAllShops } = require('../controllers/shopController');

router.post('/add', verifyToken, addShop);
router.get('/all', getAllShops);

module.exports = router;
