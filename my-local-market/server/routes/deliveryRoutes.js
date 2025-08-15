const express = require('express');
const router = express.Router();
const { registerDeliveryBoy,
     loginDeliveryBoy, 
     getAllDeliveryBoys,
     getDeliveryBoyProfile,
     toggleAvailability
     } = require('../controllers/deliveryController');
const deliveryAuth = require('../middleware/deliveryAuth');
const authMiddleware = require('../middleware/authMiddleware');

// Register
router.post('/register', registerDeliveryBoy);

// Login
router.post('/login', loginDeliveryBoy);

router.get('/db-profile', deliveryAuth, getDeliveryBoyProfile);

router.patch('/availability', deliveryAuth, toggleAvailability);

// Get all delivery boys (for seller)
router.get('/deliveryboy/all', authMiddleware, getAllDeliveryBoys);

module.exports = router;
