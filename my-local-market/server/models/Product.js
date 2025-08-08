const mongoose = require('mongoose');
require('./Seller');
require('./Shop');

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  productCode: {
    type: String,
    unique: true,
    required: true
  },
  offer: {
    isActive: { type: Boolean, default: false },
    percentage: { type: Number, default: 0 },
    previousPrice: { type: Number },
    validFrom: { type: Date },
    validTill: { type: Date },
  },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  availability: { type: Boolean, default: true },
  images: {
    type: [String],
    validate: [arr => arr.length <= 4, '{PATH} exceeds the limit of 4 images']
  },
  featured: { type: Boolean, default: false },
  whatsapp: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
