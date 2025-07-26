const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // ⬅️ Add this line
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const shopRoutes = require('./routes/shopRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes'); // if used separately

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static files from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', shopRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes); // only if separate from productRoutes

// Health Check Route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Server is live 🔥' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
