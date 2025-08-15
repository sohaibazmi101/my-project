const mongoose = require('mongoose');

const deliveryBoySchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String, required: true }, // <-- add this
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);
