const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: String,
  icon: String,
  rank: Number,
});


module.exports = mongoose.model('Category', categorySchema);
