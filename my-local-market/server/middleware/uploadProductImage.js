// server/middleware/uploadProduct.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'local-market/products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

module.exports = multer({ storage });
