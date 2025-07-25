const upload = require('../middleware/uploadProductImage');

router.post('/products/upload', auth, upload.single('image'), (req, res) => {
  res.status(200).json({ imageUrl: req.file.path });
});
