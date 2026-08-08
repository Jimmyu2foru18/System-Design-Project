require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');

const userRoutes = require('./routes/userRoutes');
const mealPlanRoutes = require('./controllers/mealPlanController');

const User = require('./models/User');
const Recipe = require('./models/Recipe');

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

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipeId = req.params.id;
    let localRecipe = null;

    try {
      localRecipe = await Recipe.findById(recipeId);
    } catch {
      localRecipe = null;
    }

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

app.post('/api/nutrition', async (req, res) => {
  try {
    const { ingredients, recipeTitle } = req.body;
    const appId = process.env.NUTRITION_APP_ID;
    const appKey = process.env.NUTRITION_APP_KEY;

    if (!appId || !appKey) {
      return res.status(500).json({ message: 'Nutrition API credentials not configured' });
    }

    const ingredientLines = Array.isArray(ingredients)
      ? ingredients.map(i => typeof i === 'string' ? i : i.name || '').filter(Boolean)
      : [];

    if (ingredientLines.length === 0) {
      return res.status(400).json({ message: 'No ingredients provided' });
    }

    const url = `https://api.edamam.com/api/nutrition-details?app_id=${appId}&app_key=${appKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: recipeTitle || 'Recipe',
        ingr: ingredientLines
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Edamam error:', response.status, text);
      return res.status(502).json({ message: 'Nutrition analysis failed', details: text });
    }

    const data = await response.json();
    res.json({
      calories: data.calories ?? 0,
      protein: Math.round((data.totalNutrients?.PROCNT?.quantity || 0) * 10) / 10,
      fat: Math.round((data.totalNutrients?.FAT?.quantity || 0) * 10) / 10,
      carbs: Math.round((data.totalNutrients?.CHOCDF?.quantity || 0) * 10) / 10,
      fiber: Math.round((data.totalNutrients?.FIBTG?.quantity || 0) * 10) / 10,
      source: 'edamam'
    });
  } catch (error) {
    console.error('Nutrition proxy error:', error);
    res.status(500).json({ message: 'Nutrition service error' });
  }
});

app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
