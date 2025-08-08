const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');
const Shop = require('../models/Shop');

exports.loginSeller = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    let seller;
    if (/^SH\d+$/.test(identifier)) {
      const shop = await Shop.findOne({ shopCode: identifier });
      if (!shop) return res.status(400).json({ message: 'Invalid credentials' });

      seller = await Seller.findById(shop.sellerId);
      if (!seller) return res.status(400).json({ message: 'Invalid credentials' });
    } else {
      seller = await Seller.findOne({ email: identifier });
      if (!seller) return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        shopCategory: seller.shopCategory,
        phone: seller.phone,
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
