const Seller = require('../models/Seller');
const Shop = require('../models/Shop');
const bcrypt = require('bcrypt');

exports.registerSeller = async (req, res) => {
  try {
    const {
      name, email, password, phone, address,
      shopCategory, whatsapp, location
    } = req.body;

    // 1. Check if email already exists
    const existing = await Seller.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create seller with hashed password
    const seller = new Seller({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      shopCategory,
      whatsapp,
      location
    });

    await seller.save();

    const shop = new Shop({
      sellerId: seller._id,
      name,
      description: '',
      address,
      category: shopCategory,
      whatsapp,
      location,
      banner: req.bannerUrl || '', //Use uploaded banner URL
      featuredProducts: [],
      newProducts: [],
    });

    await shop.save();

    res.status(201).json({ message: 'Seller and shop registered successfully' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
};

const Product = require('../models/Product');

exports.getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller).select('-password');
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    const shop = await Shop.findOne({ sellerId: seller._id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const products = await Product.find({ shop: shop._id });

    res.json({
      seller,
      shop,
      products
    });
  } catch (err) {
    console.error('Error fetching seller profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

