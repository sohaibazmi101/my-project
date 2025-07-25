const express = require('express');
const router = express.Router();

const { registerSeller } = require('../controllers/sellerController');
const upload = require('../middleware/uploadBanner'); // This should now export multer instance

// POST /api/seller/register (with shop banner image upload)
router.post('/register', upload.single('bannerImage'), registerSeller);

// You can add more routes here, like:
// router.post('/login', loginSeller);
// router.put('/update', authMiddleware, upload.single('bannerImage'), updateSeller);

module.exports = router;
