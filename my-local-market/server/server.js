const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const shopRoutes = require('./routes/shopRoutes');
const productRoutes = require('./routes/productRoutes');
const sellerRoutes = require("./routes/sellerRoutes");
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// server/server.js
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);


// Routes
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use('/api/auth', authRoutes);

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
