const Seller = require('../models/Seller');
const Shop = require('../models/Shop');

exports.registerSeller = async (req, res) => {
  try {
    const {
      name, email, password, phone, address,
      shopCategory, whatsapp, location
    } = req.body;

    // 1. Check if email already exists
    const existing = await Seller.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // 2. Create seller
    const seller = new Seller({
      name, email, password, phone, address,
      shopCategory, whatsapp, location
    });

    await seller.save();

    // ✅ 3. Create empty shop record linked to this seller
    const shop = new Shop({
      sellerId: seller._id,
      name, // or `${name}'s Shop`
      description: '',
      address,
      category: shopCategory,
      whatsapp,
      location,
      banner: '',
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
