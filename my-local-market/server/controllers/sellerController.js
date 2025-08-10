const Seller = require('../models/Seller');
const Shop = require('../models/Shop');
const bcrypt = require('bcrypt');
const Product = require('../models/Product');

// ===============================
// 1. Register Seller (with KYC)
// ===============================
exports.registerSeller = async (req, res) => {
  try {
    const {
      sellerName, // personal name
      email,
      password,
      phone,
      address,
      shopCategory,
      whatsapp,
      location,
      aadhaarNumber,
      panNumber
    } = req.body;

    // Check if seller exists
    const existing = await Seller.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // Validate file uploads
    if (!req.files || !req.files.aadhaarImage || !req.files.panImage) {
      return res.status(400).json({ message: 'Aadhaar and PAN images are required' });
    }

    const aadhaarImageUrl = req.files.aadhaarImage[0].path;
    const panImageUrl = req.files.panImage[0].path;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mask Aadhaar number
    const maskedAadhaar = aadhaarNumber
      ? `XXXX XXXX ${aadhaarNumber.slice(-4)}`
      : '';

    // Create seller
    const seller = new Seller({
      sellerName,
      email,
      password: hashedPassword,
      phone,
      address,
      shopCategory,
      whatsapp,
      location,
      aadhaarNumber: maskedAadhaar,
      aadhaarImage: aadhaarImageUrl,
      panNumber,
      panImage: panImageUrl,
      kycStatus: 'pending'
    });

    await seller.save();

    res.status(201).json({
      message: 'Seller registered successfully. Pending KYC approval.',
      sellerId: seller._id
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
};

// ===============================
// 2. Admin Approve/Reject KYC
// ===============================
exports.updateKycStatus = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    seller.kycStatus = status;
    seller.kycRejectedReason = status === 'rejected' ? reason || 'Not specified' : '';

    await seller.save();

    res.json({ message: `KYC ${status} successfully` });
  } catch (err) {
    console.error('KYC update error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ===============================
// 3. Create Shop After KYC Approval
// ===============================
exports.createShopForSeller = async (req, res) => {
  try {
    const { sellerId, shopName, description, address, category, whatsapp, location, banner } = req.body;

    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    if (seller.kycStatus !== 'approved') {
      return res.status(400).json({ message: 'KYC not approved yet' });
    }

    const lastShop = await Shop.findOne({}).sort({ shopCode: -1 }).exec();
    let newShopNumber = 10001;
    if (lastShop && lastShop.shopCode) {
      const lastNumber = parseInt(lastShop.shopCode.replace(/^SH/, ''), 10);
      if (!isNaN(lastNumber)) {
        newShopNumber = lastNumber + 1;
      }
    }
    const newShopCode = 'SH' + newShopNumber;

    const shop = new Shop({
      sellerId: seller._id,
      sellerName: seller.sellerName,
      shopCode: newShopCode,
      name: shopName,
      description: description || '',
      address,
      category,
      whatsapp,
      location,
      banner: banner || '',
      featuredProducts: [],
      newProducts: [],
    });

    await shop.save();

    res.status(201).json({
      message: 'Shop created successfully',
      shopCode: newShopCode,
      shopId: shop._id
    });
  } catch (err) {
    console.error('Shop creation error:', err.message);
    res.status(500).json({ message: 'Shop creation error', error: err.message });
  }
};

// ===============================
// 4. Get Seller Profile
// ===============================
exports.getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller).select('-password');
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    const shop = await Shop.findOne({ sellerId: seller._id });
    const products = shop ? await Product.find({ shop: shop._id }) : [];

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

// ===============================
// 5. Get All Pending KYCs (Admin View)
// ===============================
exports.getPendingKycs = async (req, res) => {
  try {
    const pendingSellers = await Seller.find({ kycStatus: 'pending' }).select('-password');
    res.json(pendingSellers);
  } catch (err) {
    console.error('Error fetching pending KYCs:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
