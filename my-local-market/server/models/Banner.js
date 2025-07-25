const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  link: { type: String },
});

module.exports = mongoose.model('Banner', bannerSchema);
