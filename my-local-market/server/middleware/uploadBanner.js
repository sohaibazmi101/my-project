// server/middleware/uploadBanner.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define upload path
const bannerUploadPath = path.join(__dirname, '../uploads/banners');

// Ensure directory exists
if (!fs.existsSync(bannerUploadPath)) {
  fs.mkdirSync(bannerUploadPath, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, bannerUploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = upload; // ✅ Export multer instance (not .single())
