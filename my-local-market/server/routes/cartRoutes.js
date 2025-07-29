const express = require('express');
const router = express.Router();
const verifyCustomer = require('../middleware/verifyCustomer');
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');

router.post('/add', verifyCustomer, addToCart);
router.get('/', verifyCustomer, getCart);
router.delete('/:productId', verifyCustomer, removeFromCart);

module.exports = router;
