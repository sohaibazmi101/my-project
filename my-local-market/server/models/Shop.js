const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    unique: true,
  },
  shopCode: {
    type: String,
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  address: { type: String },
  category: { type: String },
  whatsapp: { type: String },
  location: { type: String },
  banner: { type: String }, 
  featuredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  newProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, {
  timestamps: true,
});
module.exports = mongoose.model('Shop', shopSchema);
