const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  shopName: String,
  shopCategory: String,
  address: String,
  phone: String,
});

module.exports = mongoose.model("Seller", sellerSchema);
