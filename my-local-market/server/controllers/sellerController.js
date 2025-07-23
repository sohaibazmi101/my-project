const Seller = require("../models/Seller");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerSeller = async (req, res) => {
  const { name, email, password, shopName, shopCategory, address, phone } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const newSeller = new Seller({
      name, email, password: hashed, shopName, shopCategory, address, phone,
    });
    await newSeller.save();
    res.status(201).json({ message: "Seller registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginSeller = async (req, res) => {
  const { email, password } = req.body;
  try {
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ error: "Not found" });

    const match = await bcrypt.compare(password, seller.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET);
    res.json({ token, seller });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerSeller, loginSeller };
