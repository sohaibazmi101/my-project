const express = require('express');
const router = express.Router();
const { getAvailableOrdersForDeliveryBoy, 
    pickOrder,
    getPickedOrders,
    updateOrderStatusByDeliveryBoy,
} = require('../controllers/orderController');
const deliveryAuth = require('../middleware/deliveryAuth');

router.get('/delivery-boy/orders', deliveryAuth, getAvailableOrdersForDeliveryBoy);
router.get('/delivery-boy/orders/picked', deliveryAuth, getPickedOrders);
router.patch('/delivery-boy/orders/:orderId/pick', deliveryAuth, pickOrder);
router.patch('/delivery-boy/:orderId/status', deliveryAuth, updateOrderStatusByDeliveryBoy);

module.exports = router;
