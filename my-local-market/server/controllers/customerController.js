const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

// Helper: create token
const createToken = (customer) => {
  return jwt.sign(
    { id: customer._id, role: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/customers/register
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    // Check if email or phone already exists
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

// @route   POST /api/customers/login
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
