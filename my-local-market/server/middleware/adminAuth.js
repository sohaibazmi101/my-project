const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, auth denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) throw new Error('Not admin');
    req.admin = true;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid admin token' });
  }
};

module.exports = adminAuth;
