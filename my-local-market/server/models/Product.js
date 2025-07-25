const mongoose = require('mongoose');
require('./Seller');
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
  images: {
    type: [String], // array of 0–4 image URLs
    validate: [arr => arr.length <= 4, '{PATH} exceeds the limit of 4 images']
  },

  featured: { type: Boolean, default: false },
  whatsapp: { type: String }, 
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
