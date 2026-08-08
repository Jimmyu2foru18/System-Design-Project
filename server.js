require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const authMiddleware = require('./middleware/authMiddleware');

const userRoutes = require('./routes/userRoutes');
const mealPlanRoutes = require('./controllers/mealPlanController');

const User = require('./models/User');
const Recipe = require('./models/Recipe');
const MealPlan = require('./models/MealPlan');
const RecipeRecord = require('./models/RecipeRecord');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5000', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', userRoutes);
app.use('/api/meal-plans', mealPlanRoutes);

app.get('/', (req, res) => res.redirect('/index.html'));

app.get('/api/users/count/total', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error counting users:', error);
    res.status(500).json({ message: 'Error counting users' });
  }
});

app.get('/api/recipes/count/total', async (req, res) => {
  try {
    const count = await Recipe.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error counting recipes:', error);
    res.status(500).json({ message: 'Error counting recipes' });
  }
});

app.get('/api/users/:userId/meal-plans', async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(mealPlans);
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({ message: 'Error fetching meal plans' });
  }
});

app.delete('/api/meal-plans/:id', async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!mealPlan) return res.status(404).json({ message: 'Meal plan not found or not owned by user' });
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database operation failed', error: error.message });
  }
});

app.get('/api/admin/dashboard/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const recipeCount = await Recipe.countDocuments();
    const publicRecipes = await Recipe.countDocuments({ isPublic: true });
    const privateRecipes = await Recipe.countDocuments({ isPublic: false });
    res.json({
      userCount,
      recipeCount,
      publicRecipes,
      privateRecipes,
      newUsersThisWeek: Math.floor(userCount * 0.15),
      newRecipesThisWeek: Math.floor(recipeCount * 0.2),
      activeUsers: Math.floor(userCount * 0.6)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

app.get('/api/admin/recipes/top', async (req, res) => {
  try {
    const recipes = await Recipe.find().limit(5);
    const topRecipes = recipes.map(recipe => ({
      _id: recipe._id,
      title: recipe.title,
      views: Math.floor(Math.random() * 1000),
      favorites: Math.floor(Math.random() * 100),
      rating: (3 + Math.random() * 2).toFixed(1),
      createdAt: recipe.createdAt
    }));
    res.json(topRecipes);
  } catch (error) {
    console.error('Error fetching top recipes:', error);
    res.status(500).json({ message: 'Error fetching top recipes' });
  }
});

app.get('/api/recipe-records/:recipeId', async (req, res) => {
  try {
    let recipeRecord = await RecipeRecord.findOne({ recipeId: req.params.recipeId });
    if (!recipeRecord) {
      recipeRecord = await RecipeRecord.create({ recipeId: req.params.recipeId, ratedBy: [], favoritedBy: [] });
    }
    res.json(recipeRecord);
  } catch (error) {
    console.error('Error fetching recipe record:', error);
    res.status(500).json({ message: 'Error fetching recipe record' });
  }
});

app.post('/api/recipe-records/:recipeId/rate', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    let recipeRecord = await RecipeRecord.findOne({ recipeId });
    if (!recipeRecord) {
      recipeRecord = await RecipeRecord.create({ recipeId, ratedBy: [userId], favoritedBy: [] });
      return res.json({ rated: true, ratedCount: 1, message: 'Recipe rated successfully' });
    }

    const userIndex = recipeRecord.ratedBy.indexOf(userId);
    if (userIndex === -1) {
      recipeRecord.ratedBy.push(userId);
      await recipeRecord.save();
      return res.json({ rated: true, ratedCount: recipeRecord.ratedBy.length, message: 'Recipe rated successfully' });
    } else {
      recipeRecord.ratedBy.splice(userIndex, 1);
      await recipeRecord.save();
      return res.json({ rated: false, ratedCount: recipeRecord.ratedBy.length, message: 'Rating removed successfully' });
    }
  } catch (error) {
    console.error('Error rating recipe:', error);
    res.status(500).json({ message: 'Error rating recipe' });
  }
});

app.post('/api/recipe-records/:recipeId/favorite', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    let recipeRecord = await RecipeRecord.findOne({ recipeId });
    if (!recipeRecord) {
      recipeRecord = await RecipeRecord.create({ recipeId, ratedBy: [], favoritedBy: [userId] });
      return res.json({ favorited: true, message: 'Recipe added to favorites' });
    }

    const userIndex = recipeRecord.favoritedBy.indexOf(userId);
    if (userIndex === -1) {
      recipeRecord.favoritedBy.push(userId);
      await recipeRecord.save();
      return res.json({ favorited: true, message: 'Recipe added to favorites' });
    } else {
      recipeRecord.favoritedBy.splice(userIndex, 1);
      await recipeRecord.save();
      return res.json({ favorited: false, message: 'Recipe removed from favorites' });
    }
  } catch (error) {
    console.error('Error updating favorite status:', error);
    res.status(500).json({ message: 'Error updating favorite status' });
  }
});

app.get('/api/recipe-records/:recipeId/user/:userId/status', async (req, res) => {
  try {
    const { recipeId, userId } = req.params;
    const recipeRecord = await RecipeRecord.findOne({ recipeId });
    if (!recipeRecord) {
      return res.json({ rated: false, favorited: false, ratedCount: 0 });
    }
    res.json({
      rated: recipeRecord.ratedBy.includes(userId),
      favorited: recipeRecord.favoritedBy.includes(userId),
      ratedCount: recipeRecord.ratedBy.length
    });
  } catch (error) {
    console.error('Error checking user status:', error);
    res.status(500).json({ message: 'Error checking user status' });
  }
});

app.post('/api/users/:userId/favorites', async (req, res) => {
  try {
    const { userId } = req.params;
    const { recipeId, action } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.profileData.favorites) user.profileData.favorites = [];

    if (action === 'toggle') {
      const index = user.profileData.favorites.indexOf(recipeId);
      if (index === -1) user.profileData.favorites.push(recipeId);
      else user.profileData.favorites.splice(index, 1);
    }

    await user.save();
    res.json({ favorited: user.profileData.favorites.includes(recipeId) });
  } catch (error) {
    console.error('Error updating favorites:', error);
    res.status(500).json({ message: 'Error updating favorites' });
  }
});

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.put('/api/users/:userId', upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let avatar = user.profileData?.avatar;
    if (req.file) {
      avatar = { data: req.file.buffer, contentType: req.file.mimetype };
    }

    user.profileData = {
      ...user.profileData,
      bio: userData.bio || user.profileData?.bio,
      avatar: avatar,
      favorites: userData.favorites || user.profileData?.favorites
    };

    if (userData.name) user.name = userData.name;
    if (userData.email) user.email = userData.email;

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.profileData?.bio || '',
      hasAvatar: !!user.profileData?.avatar?.data,
      favorites: user.profileData?.favorites
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

app.post('/api/users/:userId/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profileData.avatar = { data: req.file.buffer, contentType: req.file.mimetype };
    await user.save();
    res.json({ success: true, message: 'Avatar uploaded successfully' });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

app.get('/api/users/:userId/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user?.profileData?.avatar?.data) {
      return res.status(404).json({ message: 'Avatar not found' });
    }
    res.set('Content-Type', user.profileData.avatar.contentType);
    res.send(user.profileData.avatar.data);
  } catch (error) {
    console.error('Error fetching avatar:', error);
    res.status(500).json({ message: 'Error fetching avatar' });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipeId = req.params.id;
    const localRecipe = await Recipe.findById(recipeId);
    if (localRecipe) return res.json(localRecipe);

    if (/^\d+$/.test(recipeId)) {
      const mealDbResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
      if (mealDbResponse.ok) {
        const data = await mealDbResponse.json();
        if (data.meals && data.meals.length > 0) return res.json(data.meals[0]);
      }
    }
    res.status(404).json({ message: 'Recipe not found' });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Error fetching recipe' });
  }
});

app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
