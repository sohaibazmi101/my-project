const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
  section: { type: String, required: true, unique: true }, // e.g., 'homepage', 'footer'
  content: { type: String },
});

module.exports = mongoose.model('CMS', cmsSchema);
