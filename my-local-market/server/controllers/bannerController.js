const Banner = require('../models/Banner');

exports.getBanners = async (req, res) => {
  const banners = await Banner.find().sort({ _id: -1 });
  res.json(banners);
};

exports.addBanner = async (req, res) => {
  const { imageUrl, title, description, link } = req.body;
  const banner = await Banner.create({ imageUrl, title, description, link });
  res.status(201).json(banner);
};

exports.deleteBanner = async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: 'Banner deleted' });
};
