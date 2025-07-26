// server/middleware/uploadBanner.js
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

// Configure Cloudinary (ensure .env has these)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Parse file using multer (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadBannerToCloudinary = (req, res, next) => {
  if (!req.file) return next();

  const stream = cloudinary.uploader.upload_stream(
    {
      folder: 'banners',
    },
    (err, result) => {
      if (err) {
        console.error('Cloudinary Upload Error:', err);
        return res.status(500).json({ message: 'Upload failed' });
      }
      req.bannerUrl = result.secure_url; // ✅ Save the actual Cloudinary URL
      next();
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(stream);
};

module.exports = [upload.single('banner'), uploadBannerToCloudinary];
