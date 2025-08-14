const DeliveryBoy = require('../models/DeliveryBoy');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new delivery boy
exports.registerDeliveryBoy = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if email already exists
    const existing = await DeliveryBoy.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new delivery boy
    const newDeliveryBoy = new DeliveryBoy({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newDeliveryBoy.save();

    // Generate JWT
    const token = jwt.sign({ id: newDeliveryBoy._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ token, deliveryBoy: { id: newDeliveryBoy._id, name, email, phone } });
  } catch (err) {
    console.error('Delivery boy registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login delivery boy
exports.loginDeliveryBoy = async (req, res) => {
  try {
    const { email, password } = req.body;

    const deliveryBoy = await DeliveryBoy.findOne({ email });
    if (!deliveryBoy) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, deliveryBoy.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign({ id: deliveryBoy._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ token, deliveryBoy: { id: deliveryBoy._id, name: deliveryBoy.name, email, phone: deliveryBoy.phone } });
  } catch (err) {
    console.error('Delivery boy login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
