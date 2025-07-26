const Seller = require('../models/Seller');
const Shop = require('../models/Shop'); // ✅ add this line

exports.registerSeller = async (req, res) => {
  try {
    const {
      name, email, password, phone, address,
      shopCategory, whatsapp, location
    } = req.body;

    const existing = await Seller.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const seller = new Seller({
      name, email, password, phone, address,
      shopCategory, whatsapp, location
    });

    await seller.save();

    // ✅ Automatically create a shop for the seller
    await Shop.create({
      sellerId: seller._id,
      name: name || 'My Shop',
      description: '',
      address,
      category: shopCategory,
      whatsapp,
      location,
    });

    res.status(201).json({ message: 'Seller registered successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
};
