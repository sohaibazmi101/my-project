const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const verifyCustomer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    req.customer = customer; // Attach customer info to the request
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyCustomer;
