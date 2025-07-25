const Seller = require('../models/Seller');

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
      shopCategory, whatsapp, location,
      bannerImage: req.file ? `/uploads/${req.file.filename}` : null
    });

    await seller.save();
    res.status(201).json({ message: 'Seller registered successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
};
