const RecipeRecord = require('../models/RecipeRecord');
const { isDbConnected } = require('../db');

const toggleRate = async (req, res) => {
  try {
    if (!isDbConnected()) return res.json({ rated: false, ratedCount: 0, message: 'Database not available' });
    const { recipeId } = req.params;
    const { userId } = req.body;

    let record = await RecipeRecord.findOne({ recipeId });
    if (!record) {
      record = new RecipeRecord({ recipeId, ratedBy: [], favoritedBy: [] });
    }

    const hasRated = record.ratedBy.includes(userId);
    if (hasRated) {
      record.ratedBy = record.ratedBy.filter(id => id.toString() !== userId);
    } else {
      record.ratedBy.push(userId);
    }

    await record.save();
    res.json({
      rated: !hasRated,
      ratedCount: record.ratedBy.length,
      message: hasRated ? 'Rating removed' : 'Rating added'
    });
  } catch (error) {
    console.error('Rate toggle error:', error);
    res.status(400).json({ message: 'Could not update rating' });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    if (!isDbConnected()) return res.json({ favorited: false, favorites: [], message: 'Database not available' });
    const { recipeId } = req.params;
    const { userId } = req.body;

    let record = await RecipeRecord.findOne({ recipeId });
    if (!record) {
      record = new RecipeRecord({ recipeId, ratedBy: [], favoritedBy: [] });
    }

    const isFavorited = record.favoritedBy.includes(userId);
    if (isFavorited) {
      record.favoritedBy = record.favoritedBy.filter(id => id.toString() !== userId);
    } else {
      record.favoritedBy.push(userId);
    }

    await record.save();
    res.json({
      favorited: !isFavorited,
      favorites: record.favoritedBy.map(id => id.toString()),
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites'
    });
  } catch (error) {
    console.error('Favorite toggle error:', error);
    res.status(400).json({ message: 'Could not update favorite' });
  }
};

const getUserStatus = async (req, res) => {
  try {
    if (!isDbConnected()) return res.json({ rated: false, favorited: false, ratedCount: 0 });
    const { recipeId, userId } = req.params;
    const record = await RecipeRecord.findOne({ recipeId });
    
    if (!record) {
      return res.json({
        rated: false,
        favorited: false,
        ratedCount: 0
      });
    }

    res.json({
      rated: record.ratedBy.includes(userId),
      favorited: record.favoritedBy.includes(userId),
      ratedCount: record.ratedBy.length
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(400).json({ message: 'Could not check status' });
  }
};

module.exports = {
  toggleRate,
  toggleFavorite,
  getUserStatus
};
