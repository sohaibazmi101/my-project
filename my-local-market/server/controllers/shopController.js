const Shop = require('../models/Shop');

exports.addShop = async (req, res) => {
  try {
    const { name, address, contact, category } = req.body;
    const newShop = new Shop({ name, address, contact, category, seller: req.seller.id });
    await newShop.save();
    res.status(201).json({ message: "Shop added successfully", shop: newShop });
  } catch (error) {
    console.error("Error in addShop:", error);  // <== ADD THIS LINE
    res.status(500).json({ message: "Error adding shop", error: error.message }); // <== BETTER ERROR
  }
};


// Show only shops of the logged-in seller
exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find({ seller: req.seller.id });
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shops', error });
  }
};

