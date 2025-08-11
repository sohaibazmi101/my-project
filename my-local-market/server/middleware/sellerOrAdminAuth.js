// server/middleware/sellerOrAdminAuth.js
const jwt = require('jsonwebtoken');

const sellerOrAdminAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, auth denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.isAdmin) {
      req.admin = true;
    } else {
      req.seller = decoded.id;
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = sellerOrAdminAuth;