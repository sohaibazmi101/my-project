// server/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  availability: { type: Boolean, default: true },
  imageUrl: { type: String },
  featured: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
