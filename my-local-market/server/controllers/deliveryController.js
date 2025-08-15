const DeliveryBoy = require('../models/DeliveryBoy');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerDeliveryBoy = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await DeliveryBoy.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newDeliveryBoy = new DeliveryBoy({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newDeliveryBoy.save();
    const token = jwt.sign({ id: newDeliveryBoy._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ token, deliveryBoy: { id: newDeliveryBoy._id, name, email, phone } });
  } catch (err) {
    console.error('Delivery boy registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.loginDeliveryBoy = async (req, res) => {
  try {
    const { email, password } = req.body;
    const deliveryBoy = await DeliveryBoy.findOne({ email });
    if (!deliveryBoy) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, deliveryBoy.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: deliveryBoy._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ token, deliveryBoy: { id: deliveryBoy._id, name: deliveryBoy.name, email, phone: deliveryBoy.phone } });
  } catch (err) {
    console.error('Delivery boy login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDeliveryBoyProfile = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy._id;

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId)
      .select('-password -__v');

    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }

    res.status(200).json(deliveryBoy);
  } catch (err) {
    console.error('Get delivery boy profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find({});
    res.status(200).json({ deliveryBoys });
  } catch (err) {
    console.error('Error fetching delivery boys:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy._id;
    const updatedDeliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!updatedDeliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }
    const newStatus = !updatedDeliveryBoy.isActive;
    const result = await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      { isActive: newStatus },
      { new: true }
    );
    res.json({
      message: "Status updated successfully",
      isActive: result.isActive
    });
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
