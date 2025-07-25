const CMS = require('../models/CMS');

exports.getCMSContent = async (req, res) => {
  const section = req.params.section;
  const content = await CMS.findOne({ section });
  res.json(content || { section, content: '' });
};

exports.updateCMSContent = async (req, res) => {
  const section = req.params.section;
  const { content } = req.body;

  const updated = await CMS.findOneAndUpdate(
    { section },
    { content },
    { new: true, upsert: true }
  );
  res.json(updated);
};
