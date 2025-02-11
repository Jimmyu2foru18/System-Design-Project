/**
 * @fileoverview Recipe Service that manages:
 * - Recipe CRUD operations
 * - Search and filter functionality
 * - Rating system
 * - Favoriting system
 * - Category management
 * - Recipe recommendations
 * 
 * @authors James McGuigan, Steven Foster
 */

// Add this method to the RecipeService class
async getRandomRecipe() {
    try {
        const response = await this.api.get('/recipes/random');
        return response.data;
    } catch (error) {
        console.error('Error getting random recipe:', error);
        throw error;
    }
}

/**
 * Get top rated recipes by category
 * @param {Object} params - Query parameters
 * @param {string} params.category - Recipe category
 * @param {number} params.limit - Maximum number of recipes to return
 * @param {number} params.minRating - Minimum rating threshold
 * @returns {Promise<Array>} Array of recipe objects
 */
async getTopRecipes(params) {
    try {
        const response = await this.api.get('/recipes/top', { params });
        return response.data;
    } catch (error) {
        console.error('Error getting top recipes:', error);
        throw error;
    }
}

/**
 * Create a new recipe
 * @param {FormData} formData - Recipe form data including image
 * @returns {Promise<Object>} Created recipe object
 */
async createRecipe(formData) {
    try {
        const response = await this.api.post('/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating recipe:', error);
        throw error;
    }
}

/**
 * Update an existing recipe
 * @param {string} recipeId - ID of the recipe to update
 * @param {FormData} formData - Updated recipe form data including image
 * @returns {Promise<Object>} Updated recipe object
 */
async updateRecipe(recipeId, formData) {
    try {
        const response = await this.api.put(`/${recipeId}`, formData);
        return response.data;
    } catch (error) {
        console.error('Error updating recipe:', error);
        throw error;
    }
}

/**
 * Get a recipe by ID
 * @param {string} id - ID of the recipe to retrieve
 * @returns {Promise<Object>} Retrieved recipe object
 */
async getRecipe(id) {
    try {
        const response = await this.api.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error getting recipe:', error);
        throw error;
    }
}

/**
 * Get all recipes with filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Array of recipe objects
 */
async getRecipes(params = {}) {
    try {
        const response = await this.api.get('/', { params });
        return response.data;
    } catch (error) {
        console.error('Error getting recipes:', error);
        throw error;
    }
}

/**
 * Delete a recipe
 * @param {string} id - ID of the recipe to delete
 */
async deleteRecipe(id) {
    try {
        await this.api.delete(`/${id}`);
    } catch (error) {
        console.error('Error deleting recipe:', error);
        throw error;
    }
}

/**
 * Rate a recipe
 * @param {string} recipeId - ID of the recipe to rate
 * @param {number} rating - Rating to assign to the recipe
 * @returns {Promise<Object>} Rated recipe object
 */
async rateRecipe(recipeId, rating) {
    try {
        const response = await this.api.post(`/${recipeId}/rate`, { rating });
        return response.data;
    } catch (error) {
        console.error('Error rating recipe:', error);
        throw error;
    }
}

/**
 * Toggle favorite status of a recipe
 * @param {string} recipeId - ID of the recipe to toggle favorite status
 * @returns {Promise<Object>} Updated favorite status
 */
async toggleFavorite(recipeId) {
    try {
        const response = await this.api.post(`/${recipeId}/favorite`);
        return response.data;
    } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
    }
}

/**
 * Get user's favorite recipes
 * @returns {Promise<Array>} Array of favorite recipe objects
 */
async getFavorites() {
    try {
        const response = await this.api.get('/favorites');
        return response.data;
    } catch (error) {
        console.error('Error getting favorites:', error);
        throw error;
    }
}

/**
 * Print a recipe
 * @param {string} recipeId - ID of the recipe to print
 * @returns {Promise<Object>} Printable recipe object
 */
async printRecipe(recipeId) {
    try {
        const response = await this.api.get(`/${recipeId}/print`);
        return response.data;
    } catch (error) {
        console.error('Error getting printable recipe:', error);
        throw error;
    }
}

/**
 * Save a meal plan
 * @param {Object} planData - Meal plan data
 * @returns {Promise<Object>} Saved meal plan object
 */
async saveMealPlan(planData) {
    try {
        const response = await this.api.post('/meal-plans', planData);
        return response.data;
    } catch (error) {
        console.error('Error saving meal plan:', error);
        throw error;
    }
}

/**
 * Get user's meal plans
 * @returns {Promise<Array>} Array of meal plan objects
 */
async getUserMealPlans() {
    try {
        const response = await this.api.get('/meal-plans');
        return response.data;
    } catch (error) {
        console.error('Error getting meal plans:', error);
        throw error;
    }
}

/**
 * Delete a meal plan
 * @param {string} planId - ID of the meal plan to delete
 */
async deleteMealPlan(planId) {
    try {
        await this.api.delete(`/meal-plans/${planId}`);
    } catch (error) {
        console.error('Error deleting meal plan:', error);
        throw error;
    }
}

/**
 * Search recipes
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Array of recipe objects
 */
async searchRecipes(params = {}) {
    try {
        const response = await this.api.get('/search', { params });
        return response.data;
    } catch (error) {
        console.error('Error searching recipes:', error);
        throw error;
    }
}

async updateRecipePrivacy(recipeId, isPrivate) {
    try {
        const response = await this.api.put(`/${recipeId}/privacy`, {
            private: isPrivate
        });
        return response.data;
    } catch (error) {
        console.error('Error updating recipe privacy:', error);
        throw error;
    }
}

// Get public recipes for the main site
async getPublicRecipes(params = {}) {
    try {
        const response = await this.api.get('/public', { params });
        return response.data;
    } catch (error) {
        console.error('Error getting public recipes:', error);
        throw error;
    }
}
