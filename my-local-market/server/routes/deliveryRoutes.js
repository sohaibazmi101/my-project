const express = require('express');
const router = express.Router();
const { registerDeliveryBoy, loginDeliveryBoy } = require('../controllers/deliveryController');
const deliveryAuth = require('../middleware/deliveryAuth'); // for protected routes later

// @route   POST /api/delivery/register
// @desc    Register a new delivery boy
// @access  Public
router.post('/register', registerDeliveryBoy);

// @route   POST /api/delivery/login
// @desc    Login delivery boy
// @access  Public
router.post('/login', loginDeliveryBoy);

// Example of a protected route (can be used later)
// router.get('/dashboard', deliveryAuth, (req, res) => {
//   res.json({ message: `Welcome, ${req.deliveryBoy.name}` });
// });

module.exports = router;
