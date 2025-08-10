const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    unique: true,
  },
  sellerName: { type: String, required: true },
  shopCode: {
    type: String,
    required: true,
    unique: true,
  },
  name: { type: String, required: true }, // Shop name (e.g., Raja Store)
  description: { type: String, default: '' },
  address: { type: String },
  category: { type: String },
  whatsapp: { type: String },
  location: { type: String },
  banner: { type: String }, 
  featuredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  newProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  featuredPosition: {
    type: Number,
    min: 1,
    unique: true, 
    sparse: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Shop', shopSchema);
