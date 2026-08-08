const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isDbConnected } = require('../db');
const { 
  registerUser, 
  loginUser, 
  getUserProfileById, 
  updateUserProfile,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
  googleAuth,
  googleSignup
} = require('../controllers/userController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Import recipe controller functions
const {
  createRecipe,
  getUserRecipes,
  getPublicRecipes,
  updateRecipe,
  deleteRecipe,
  getRecipeById
} = require('../controllers/recipeController');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-auth', googleAuth);
router.post('/google-signup', googleSignup);

// Profile routes
router.get('/profile/:id', getUserProfileById);
router.get('/users/:id', getUserProfileById);
router.get('/users/:id/avatar', async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ message: 'Database not available' });
    const user = await User.findById(req.params.id);
    if (!user || !user.profileData?.avatar?.data) {
      return res.status(404).json({ message: 'Avatar not found' });
    }
    res.set('Content-Type', user.profileData.avatar.contentType || 'image/jpeg');
    res.send(user.profileData.avatar.data);
  } catch (error) {
    console.error('Avatar fetch error:', error);
    res.status(500).json({ message: 'Could not fetch avatar' });
  }
});
router.post('/profile', upload.single('avatar'), updateUserProfile);
router.post('/users/profile', upload.single('avatar'), updateUserProfile);
router.put('/users/:id', upload.single('avatar'), updateUserProfile);

// Recipe routes
router.post('/recipes', createRecipe);
router.get('/recipes/user/:userId', getUserRecipes);
router.get('/recipes/public', getPublicRecipes);
router.put('/recipes/:id', updateRecipe);
router.delete('/recipes/:id', deleteRecipe);

// Favorites routes
router.post('/favorites/add', addToFavorites);
router.post('/favorites/remove', removeFromFavorites);
router.get('/favorites/check/:userId/:recipeId', checkFavorite);

module.exports = router;