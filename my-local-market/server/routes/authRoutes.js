const express = require('express');
const router = express.Router();

const { registerSeller } = require('../controllers/sellerController');

const { loginSeller } = require('../controllers/authController');

router.post('/seller/register', registerSeller);
router.post('/seller/login', loginSeller);

module.exports = router;
