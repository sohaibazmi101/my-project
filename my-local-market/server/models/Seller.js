const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  sellerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  shopCategory: { type: String, required: true },
  whatsapp: { type: String, required: true },
  location: { type: String },
  aadhaarNumber: { type: String },
  aadhaarImage: { type: String },
  panNumber: { type: String },
  panImage: { type: String },
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  kycRejectedReason: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Seller', sellerSchema);
