const Shop = require('../models/Shop');
const Product = require('../models/Product');

exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      description,
      availability,
      images,
      offer
    } = req.body;

    if (!images || !images[0]) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const shop = await Shop.findOne({ sellerId: req.seller });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found for this seller' });
    }

    // Find last productCode and generate new one
    const lastProduct = await Product.findOne({})
      .sort({ productCode: -1 })
      .exec();

    let newProductNumber = 10001;
    if (lastProduct && lastProduct.productCode) {
      const lastNumber = parseInt(lastProduct.productCode.replace(/^PR/, ''), 10);
      if (!isNaN(lastNumber)) {
        newProductNumber = lastNumber + 1;
      }
    }

    const newProductCode = 'PR' + newProductNumber;

    const productData = {
      sellerId: req.seller,
      shop: shop._id,
      productCode: newProductCode,
      name,
      category,
      price,
      description,
      availability,
      images,
    };

    if (offer) {
      productData.offer = offer;
    }

    const product = await Product.create(productData);

    res.status(201).json({ message: 'Product added', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const query = { productCode: req.params.productCode };

    if (!req.admin) {
      query.sellerId = req.seller;
    }

    const product = await Product.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Product updated', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const query = { productCode: req.params.productCode };

    if (!req.admin) {
      query.sellerId = req.seller;
    }

    const result = await Product.findOneAndDelete(query);
    if (!result) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('sellerId', 'name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.featured = !product.featured;
    await product.save();

    res.json({ message: 'Updated', featured: product.featured });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(6);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('sellerId');

    res.json(products);
  } catch (err) {
    console.error('❌ Error in getNewArrivals:', err.message, err.stack);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

exports.searchProducts = async (req, res) => {
  const q = req.query.q;
  const regex = new RegExp(q, 'i');
  try {
    const products = await Product.find({ name: regex });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Search failed' });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.name);
    const products = await Product.find({
      category: { $regex: new RegExp(`^${categoryName}$`, 'i') }
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching category products' });
  }
};

// New: Get all active offers products
exports.getOfferProducts = async (req, res) => {
  try {
    const now = new Date();
    const products = await Product.find({
      'offer.isActive': true,
      $and: [
        { $or: [{ 'offer.validFrom': { $exists: false } }, { 'offer.validFrom': { $lte: now } }] },
        { $or: [{ 'offer.validTill': { $exists: false } }, { 'offer.validTill': { $gte: now } }] },
      ],
    })
      .populate('sellerId', 'name')
      .limit(10);

    res.json(products);
  } catch (err) {
    console.error('Error fetching offer products:', err);
    res.status(500).json({ message: 'Error fetching offers' });
  }
};
