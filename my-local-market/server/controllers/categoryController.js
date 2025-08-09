const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getTopCategoriesWithProducts = async (req, res) => {
  try {
    const topCategories = await Category.find()
      .sort({ rank: 1 }) // Sort by rank to get the top categories
      .limit(5);

    const categoriesWithProducts = await Promise.all(
      topCategories.map(async (category) => {
        const randomProducts = await Product.aggregate([
          { $match: { category: category._id } },
          { $sample: { size: 20 } }, // Get 20 random products
          {
            $lookup: {
              from: 'shops', // The collection name for your shops
              localField: 'shop',
              foreignField: '_id',
              as: 'shopDetails'
            }
          },
          { $unwind: '$shopDetails' }
        ]);
        
        return {
          _id: category._id,
          name: category.name,
          icon: category.icon,
          products: randomProducts
        };
      })
    );

    res.json(categoriesWithProducts);
  } catch (error) {
    console.error('❌ getTopCategoriesWithProducts Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;

    if (!name || !icon) {
      return res.status(400).json({ message: 'Name and icon required' });
    }

    const categoryCount = await Category.countDocuments();
    const rank = categoryCount + 1;

    const category = await Category.create({ name, icon, rank });
    res.status(201).json(category);
  } catch (err) {
    console.error('Add Category Error:', err);
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
