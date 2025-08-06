const Category = require('../models/Category');

exports.addCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const category = await Category.create({ name, icon });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCategoryRank = async (req, res) => {
  const { id } = req.params;
  const { direction } = req.body; // 'up' or 'down'

  const category = await Category.findById(id);
  if (!category) return res.status(404).json({ message: 'Category not found' });

  const swapWith = await Category.findOne({
    rank: direction === 'up' ? category.rank - 1 : category.rank + 1
  });

  if (!swapWith) return res.status(400).json({ message: 'Cannot move further' });

  [category.rank, swapWith.rank] = [swapWith.rank, category.rank];

  await category.save();
  await swapWith.save();

  res.json({ message: 'Rank updated' });
};
