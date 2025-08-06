// server/middleware/uploadCategoryImage.js
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

// Configure Cloudinary (make sure .env has the correct keys)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to stream upload to Cloudinary
const uploadCategoryImageToCloudinary = (req, res, next) => {
  if (!req.file) return next();

  const stream = cloudinary.uploader.upload_stream(
    {
      folder: 'categories',
    },
    (err, result) => {
      if (err) {
        console.error('Cloudinary Upload Error:', err);
        return res.status(500).json({ message: 'Upload failed' });
      }
      req.categoryImageUrl = result.secure_url; // ✅ Save Cloudinary image URL
      next();
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(stream);
};

module.exports = [upload.single('categoryImage'), uploadCategoryImageToCloudinary];
