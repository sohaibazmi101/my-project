const express = require('express');
const router = express.Router();
const { registerSeller, loginSeller } = require('../controllers/authController');

router.post('/register', registerSeller);
router.post('/login', loginSeller);

module.exports = router;
