const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadCategoryToCloudinary = (req, res, next) => {
    if (!req.file) return next();

    const stream = cloudinary.uploader.upload_stream(
        {
            folder: 'categories',
            transformation: [{ width: 200, height: 200, crop: 'fill', radius: 'max' }], // optional styling
        },
        (err, result) => {
            if (err) {
                console.error('🛑 Cloudinary Category Upload Error:', err);
                return res.status(500).json({ message: 'Category image upload failed' });
            }
            req.categoryImageUrl = result.secure_url;
            next();
        }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
};

module.exports = [upload.single('icon'), uploadCategoryToCloudinary];
