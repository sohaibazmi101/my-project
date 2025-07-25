const jwt = require('jsonwebtoken');

// Get admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Admin login controller
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // Check credentials
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  // Send token
  res.status(200).json({ token });
};
