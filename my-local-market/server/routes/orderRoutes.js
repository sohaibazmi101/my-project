const express = require('express');
const router = express.Router();
const { getAvailableOrdersForDeliveryBoy, 
    pickOrder,
} = require('../controllers/orderController');
const deliveryAuth = require('../middleware/deliveryAuth');

router.get('/delivery-boy/orders', deliveryAuth, getAvailableOrdersForDeliveryBoy);
router.patch('/delivery-boy/orders/:orderId/pick', deliveryAuth, pickOrder);

module.exports = router;
