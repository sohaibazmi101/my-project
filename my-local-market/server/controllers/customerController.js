const Customer = require('../models/Customer');
const Product = require('../models/Product')
const jwt = require('jsonwebtoken');

const createToken = (customer) => {
  return jwt.sign(
    { id: customer._id, role: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    const existingEmail = await Customer.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: 'Email already in use' });

    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone) return res.status(400).json({ error: 'Phone already in use' });

    const newCustomer = new Customer({ name, email, phone, password, address });
    await newCustomer.save();

    const token = createToken(newCustomer);
    res.status(201).json({ customer: newCustomer, token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while registering customer' });
  }
};

exports.loginCustomer = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Find by email or phone
    const customer = await Customer.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
    });

    if (!customer) return res.status(400).json({ error: 'No customer found' });

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    const token = createToken(customer);
    res.status(200).json({ customer, token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.googleLoginCustomer = async (req, res) => {
  try {
    const { name, email, picture, googleId } = req.body;

    console.log("Incoming Google login:", req.body); // Add this line

    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    let customer = await Customer.findOne({ email });

    if (!customer) {
      customer = new Customer({
        name,
        email,
        phone: '',
        address: {},
        profileImage: picture || '',
        googleId: googleId || ''
      });
      await customer.save();
    }

    const token = createToken(customer);
    res.status(200).json({ customer, token });

  } catch (err) {
    console.error('Google login failed (backend error):', err); // Improved logging
    res.status(500).json({ error: 'Google login failed' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const { name, email, phone, address } = req.body;

    const updated = await Customer.findByIdAndUpdate(
      customerId,
      {
        name,
        email,
        phone,
        address,
      },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('Profile update failed:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
};

exports.getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id).select('-password');
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    console.error('Error loading profile:', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
};

exports.addRecentlyViewed = async (req, res) => {
  const customerId = req.customer._id;
  const { productId } = req.body;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.recentlyViewed = customer.recentlyViewed.filter(id => id.toString() !== productId);
    customer.recentlyViewed.unshift(productId);

    if (customer.recentlyViewed.length > 10) {
      customer.recentlyViewed = customer.recentlyViewed.slice(0, 10);
    }

    await customer.save();
    res.status(200).json({ message: 'Added to recently viewed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getRecentlyViewed = async (req, res) => {
  const customerId = req.customer._id;

  try {
    const customer = await Customer.findById(customerId).populate({
      path: 'recentlyViewed',
      model: Product,
    });

    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    res.status(200).json({ recentlyViewed: customer.recentlyViewed });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
