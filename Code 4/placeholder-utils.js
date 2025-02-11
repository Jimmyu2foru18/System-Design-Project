/**
 * @fileoverview Placeholder utilities that provide:
 * - Mock recipe data generation
 * - Sample images, titles, and descriptions
 * - Trending recipes simulation
 * - Featured recipes generation
 * - Search and filter functionality
 * - Rating and favorite system simulation
 * 
 * @authors James McGuigan, Steven Foster
 */

// Placeholder utilities for recipe data before database integration
const PlaceholderUtils = {
    // Sample images for recipes
    images: [
        images: [
        'https://upload.wikimedia.org/wikipedia/commons/4/45/Plated_dinner.jpg', // Dinner
        'https://upload.wikimedia.org/wikipedia/commons/0/0b/Spaghetti_alle_Vongole.jpg', // Pasta
        'https://upload.wikimedia.org/wikipedia/commons/3/39/Roast_chicken.jpg', // Chicken
        'https://upload.wikimedia.org/wikipedia/commons/7/7f/Greek_salad.jpg', // Salad
        'https://upload.wikimedia.org/wikipedia/commons/9/92/Chocolate_cake.jpg' // Dessert
    ],

    // Sample recipe titles
    titles: [
        'Creamy Garlic Pasta',
        'Grilled Chicken with Herbs',
        'Mediterranean Salad',
        'Chocolate Lava Cake',
        'Spicy Thai Curry',
        'Classic Beef Burger',
        'Vegetarian Pizza',
        'Fresh Sushi Roll',
        'Homemade Tacos',
        'Apple Pie',
        'BBQ Ribs',
        'Caesar Salad',
        'Mushroom Risotto',
        'Fish and Chips',
        'Beef Stir Fry'
    ],

    // Sample descriptions
    descriptions: [
        'A delicious homemade recipe perfect for family dinners...',
        'Quick and easy meal ready in under 30 minutes...',
        'Healthy and nutritious with fresh ingredients...',
        'Classic comfort food with a modern twist...',
        'Spicy and flavorful dish that will warm your soul...'
    ],

    // Generate a random recipe
    generateRecipe(id) {
        const randomRating = (Math.random() * 2 + 3).toFixed(1); // Rating between 3.0 and 5.0
        const randomRatingCount = Math.floor(Math.random() * 500) + 50; // Between 50 and 550 ratings
        const randomVisits = Math.floor(Math.random() * 1000) + 100; // Between 100 and 1100 visits

        return {
            _id: id || `recipe-${Math.random().toString(36).substr(2, 9)}`,
            title: this.titles[Math.floor(Math.random() * this.titles.length)],
            description: this.descriptions[Math.floor(Math.random() * this.descriptions.length)],
            image: this.images[Math.floor(Math.random() * this.images.length)],
            rating: parseFloat(randomRating),
            ratingCount: randomRatingCount,
            visits: randomVisits,
            isFavorited: Math.random() > 0.7, // 30% chance of being favorited
            createdAt: new Date(Date.now() - Math.random() * 10000000000),
            author: {
                name: 'Test User',
                id: 'user-123'
            },
            category: ['breakfast', 'lunch', 'dinner', 'dessert'][Math.floor(Math.random() * 4)],
            prepTime: `${Math.floor(Math.random() * 30) + 10} mins`,
            cookTime: `${Math.floor(Math.random() * 45) + 15} mins`,
            servings: Math.floor(Math.random() * 4) + 2
        };
    },

    // Generate multiple recipes
    generateRecipes(count = 10) {
        return Array(count).fill(null).map(() => this.generateRecipe());
    },

    // Get trending recipes (top visited)
    getTrendingRecipes() {
        const recipes = this.generateRecipes(5);
        recipes.forEach(recipe => {
            recipe.visits = Math.floor(Math.random() * 1000) + 500; // Higher visit counts
        });
        return recipes.sort((a, b) => b.visits - a.visits);
    },

    // Get featured recipes (random selection)
    getFeaturedRecipes() {
        return this.generateRecipes(12);
    },

    // Get recommended recipes (high rated)
    getRecommendedRecipes() {
        const recipes = this.generateRecipes(12);
        recipes.forEach(recipe => {
            recipe.rating = (Math.random() * 1 + 4).toFixed(1); // Rating between 4.0 and 5.0
        });
        return recipes.sort((a, b) => b.rating - a.rating);
    },

    // Search recipes with filters
    searchRecipes(params = {}) {
        let recipes = this.generateRecipes(20);
        
        if (params.search) {
            recipes = recipes.filter(recipe => 
                recipe.title.toLowerCase().includes(params.search.toLowerCase())
            );
        }

        if (params.category) {
            recipes = recipes.filter(recipe => recipe.category === params.category);
        }

        if (params.minRating) {
            recipes = recipes.filter(recipe => recipe.rating >= params.minRating);
        }

        return recipes;
    },

    // Get recipes by category
    getRecipesByCategory(category) {
        const recipes = this.generateRecipes(8);
        recipes.forEach(recipe => recipe.category = category);
        return recipes;
    },

    // Mock favorite toggling
    toggleFavorite(recipeId) {
        return {
            success: true,
            favorited: Math.random() > 0.5
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlaceholderUtils;
} 
