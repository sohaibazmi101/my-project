const jwt = require('jsonwebtoken');
const DeliveryBoy = require('../models/DeliveryBoy');

const deliveryAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const deliveryBoy = await DeliveryBoy.findById(decoded.id); // make sure token payload uses { id: ... }

    if (!deliveryBoy) return res.status(401).json({ message: 'Invalid token' });

    req.deliveryBoy = deliveryBoy;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};

module.exports = deliveryAuth;
