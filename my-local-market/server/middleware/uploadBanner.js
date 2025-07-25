// ✅ uploadBanner.js (middleware)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const bannerUploadPath = 'uploads/shopBanners/';
if (!fs.existsSync(bannerUploadPath)) {
  fs.mkdirSync(bannerUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, bannerUploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = upload; // ✅ export multer instance, NOT .single()
