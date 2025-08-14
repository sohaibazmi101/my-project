const express = require('express');
const router = express.Router();
const { assignDeliveryBoys } = require('../controllers/orderController');
const { authShopOwner } = require('../middleware/authMiddleware');
const { getAvailableOrdersForDeliveryBoy, pickOrder } = require('../controllers/orderController');
const { authDeliveryBoy } = require('../middleware/authMiddleware');

router.patch('/orders/:orderId/assign-delivery', authShopOwner, assignDeliveryBoys);
router.get('/delivery-boy/orders', authDeliveryBoy, getAvailableOrdersForDeliveryBoy);
router.patch('/delivery-boy/orders/:orderId/pick', authDeliveryBoy, pickOrder);
router.patch('/delivery-boy/orders/:orderId/update', authDeliveryBoy, updateOrderStatus);



module.exports = router;
