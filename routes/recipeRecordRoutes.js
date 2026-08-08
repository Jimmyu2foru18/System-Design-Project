const express = require('express');
const router = express.Router();
const { toggleRate, toggleFavorite, getUserStatus } = require('../controllers/recipeRecordController');

router.post('/:recipeId/rate', toggleRate);
router.post('/:recipeId/favorite', toggleFavorite);
router.get('/:recipeId/user/:userId/status', getUserStatus);

module.exports = router;
