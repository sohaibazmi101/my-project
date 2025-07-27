// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static files from /uploads (for images like banners)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Route Imports
const authRoutes = require('./routes/authRoutes');
const sellerRoutes = require('./routes/sellerRoutes');     // ✅ Added
const productRoutes = require('./routes/productRoutes');
const shopRoutes = require('./routes/shopRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');     // If used
const customerRoutes = require('./routes/customerRoutes');

app.use('/api/customers', customerRoutes);
app.use('/api', authRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api', productRoutes);
app.use('/api', shopRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes); // optional

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Server is live 🔥' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// General Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
