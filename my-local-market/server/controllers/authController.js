const Seller = require('../models/Seller');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerSeller = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) return res.status(400).json({ message: 'Seller already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = new Seller({ name, email, password: hashedPassword });
    await seller.save();

    res.status(201).json({ message: 'Seller registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
};

exports.loginSeller = async (req, res) => {
  const { email, password } = req.body;
  try {
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token, seller });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};
