// middleware/uploadCategoryImage.js
const { uploader } = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary: uploader,
  params: {
    folder: 'categories',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

module.exports = (req, res, next) => {
  const uploadSingle = upload.single('categoryImage'); // must match FormData key

  uploadSingle(req, res, function (err) {
    if (err) {
      console.error('🛑 Upload error:', err);
      return res.status(500).json({ message: 'Upload failed', error: err.message });
    }

    if (!req.file) {
      console.error('🛑 No file found in request.');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Debug log to inspect file structure
    console.log('✅ Uploaded file object:', req.file);

    // Use correct URL field (Cloudinary might return either path or secure_url)
    req.categoryImageUrl = req.file.path || req.file.secure_url;

    if (!req.categoryImageUrl) {
      console.error('🛑 File uploaded, but URL not found.');
      return res.status(500).json({ message: 'File uploaded but URL missing' });
    }

    next();
  });
};
