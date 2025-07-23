const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  shopName: String,
  address: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
