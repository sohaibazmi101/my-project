const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  contact: String,
  category: String,
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
});

module.exports = mongoose.model('Shop', shopSchema);
