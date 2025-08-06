// middleware/uploadCategoryImage.js
const { uploader } = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Storage config (can reuse cloudinary setup)
const storage = new CloudinaryStorage({
  cloudinary: uploader,
  params: {
    folder: 'categories',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

module.exports = (req, res, next) => {
  const uploadSingle = upload.single('categoryImage'); // 👈 name must match frontend FormData

  uploadSingle(req, res, function (err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ message: 'Upload failed' });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    req.categoryImageUrl = req.file.path; // 👈 Save the URL for controller
    next();
  });
};
