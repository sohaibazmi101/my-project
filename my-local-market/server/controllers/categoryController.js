// server/controllers/categoryController.js
exports.getCategories = async (req, res) => {
  try {
    const categories = ['Grocery', 'Electronics', 'Clothing', 'Stationery', 'Pharmacy'];
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};
