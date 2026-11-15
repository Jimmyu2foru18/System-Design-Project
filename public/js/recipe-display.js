/**
 * Recipe display controller.
 * Handles recipe display, nutrition calculation, rating, favorites, and printing.
 */

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (!recipeId) {
        showError('No recipe selected. Please choose a recipe from the recipes page.');
        return;
    }

    fetchRecipe(recipeId);
});

/**
 * Fetch recipe data from API with layered fallbacks.
 * Order: sessionStorage cache -> backend /api/recipes/:id -> MealDB API -> Edamam API.
 * @param {string} id - Recipe ID (MealDB numeric, local ObjectId, or Edamam URI)
 * @param {string} sourceHint - 'mealdb', 'edamam', 'local', or undefined
 */
async function fetchRecipe(id, sourceHint) {
    const encodedId = encodeURIComponent(id);

    // 1. SessionStorage cache (recipes list page caches all recipes by ID)
    try {
        const cached = sessionStorage.getItem('recspicy_recipes_by_id');
        if (cached) {
            const byId = JSON.parse(cached);
            if (byId[id]) {
                console.log('Recipe found in sessionStorage cache:', id);
                await checkRecipeRecordStatus(id);
                displayRecipe(byId[id]);
                hideLoading();
                return;
            }
        }
    } catch (e) {
        console.error('Error reading recipe cache from sessionStorage:', e);
    }

    // 2. Backend proxy /api/recipes/:id (local DB + MealDB numeric IDs)
    try {
        showLoading('Loading recipe...');
        const response = await fetch(`/api/recipes/${encodedId}`, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const recipe = await response.json();
            const normalized = normalizeRecipe(recipe, id);
            await checkRecipeRecordStatus(id);
            displayRecipe(normalized);
            hideLoading();
            return;
        }
    } catch (error) {
        console.error('Backend recipe lookup failed:', error);
    }

    // 3. MealDB API directly (for numeric MealDB IDs)
    if (typeof window.recipeApi?.getRecipeById === 'function') {
        try {
            const recipe = await window.recipeApi.getRecipeById(id);
            if (recipe) {
                await checkRecipeRecordStatus(id);
                displayRecipe(recipe);
                hideLoading();
                return;
            }
        } catch (error) {
            console.error('MealDB recipe lookup failed:', error);
        }
    }

    // 4. Edamam API directly (for Edamam URIs)
    if (sourceHint === 'edamam' || id.startsWith('http')) {
        try {
            const recipe = await fetchEdamamRecipeById(id);
            if (recipe) {
                await checkRecipeRecordStatus(id);
                displayRecipe(recipe);
                hideLoading();
                return;
            }
        } catch (error) {
            console.error('Edamam recipe lookup failed:', error);
        }
    }

    throw new Error(`Recipe not found (id: ${id}${sourceHint ? ', source: ' + sourceHint : ''})`);
}

/**
 * Fetch a single Edamam recipe by URI.
 * @param {string} uri - Edamam recipe URI
 */
async function fetchEdamamRecipeById(uri) {
    const appId = window.RECSPICY_CONFIG?.NUTRITION_APP_ID || '';
    const appKey = window.RECSPICY_CONFIG?.NUTRITION_APP_KEY || '';

    if (!appId || !appKey) {
        throw new Error('Edamam credentials not configured');
    }

    const params = new URLSearchParams({ app_id: appId, app_key: appKey, r: uri });
    const url = `https://api.edamam.com/api/recipes/v2?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Edamam error ${response.status}`);
    }

    const data = await response.json();
    if (!data.hits || !data.hits.length) return null;

    const hit = data.hits[0];
    const recipe = hit.recipe;
    const ingredients = recipe.ingredients || [];

    return {
        id: recipe.uri,
        title: recipe.label,
        description: recipe.source || recipe.label,
        image: recipe.image,
        cookTime: recipe.totalTime ? Math.round(recipe.totalTime) : 30,
        servings: recipe.yield ? Math.round(recipe.yield) : 4,
        difficulty: recipe.totalTime > 60 ? 'Hard' : recipe.totalTime > 30 ? 'Medium' : 'Easy',
        rating: '?',
        categories: recipe.cuisineType || [],
        dietaryCategories: [],
        allergens: [],
        mealTypes: recipe.mealType || [],
        ingredients: ingredients.map(ing => ({ name: ing.food || ing.text || '', quantity: ing.quantity || 'to taste' })),
        instructions: recipe.ingredientLines || [],
        source: 'edamam'
    };
}

/**
 * Normalize recipe data from various sources.
 * @param {Object} recipe - Raw recipe object
 * @param {string} fallbackId - Fallback ID if not present
 * @returns {Object} Normalized recipe
 */
function normalizeRecipe(recipe, fallbackId) {
    if (!recipe) return null;

    // Already normalized by frontend API
    if (recipe.source === 'mealdb' || recipe.source === 'edamam' || recipe.source === 'local') {
        return recipe;
    }

    // Already normalized with ingredients/instructions
    if (recipe.ingredients || recipe.instructions) {
        return recipe;
    }

    // Raw Edamam format from backend proxy or direct API
    if (recipe.uri || recipe.ingredientLines || recipe.label) {
        const ingredients = (recipe.ingredients || []).map(ing => ({
            name: ing.food || ing.text || '',
            quantity: ing.quantity || 'to taste'
        }));

        return {
            id: recipe.uri,
            title: recipe.label,
            description: recipe.source || recipe.label,
            image: recipe.image,
            cookTime: recipe.totalTime ? Math.round(recipe.totalTime) : 30,
            servings: recipe.yield ? Math.round(recipe.yield) : 4,
            difficulty: recipe.totalTime > 60 ? 'Hard' : recipe.totalTime > 30 ? 'Medium' : 'Easy',
            rating: '?',
            categories: recipe.cuisineType || [],
            dietaryCategories: [],
            allergens: [],
            mealTypes: recipe.mealType || [],
            ingredients,
            instructions: recipe.ingredientLines || [],
            source: 'edamam'
        };
    }

    // Raw MealDB format from backend proxy
    if (recipe.strMeal) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push({ name: ingredient, quantity: measure || 'to taste' });
            }
        }

        const instructions = recipe.strInstructions
            .split('\r\n')
            .filter(step => step.trim())
            .map((text, index) => ({ step: index + 1, instruction: text.trim() }));

        const difficulty = ingredients.length > 10 || instructions.length > 7 ? 'Hard'
            : ingredients.length > 5 || instructions.length > 4 ? 'Medium' : 'Easy';

        const cookTime = Math.max(15, ingredients.length * 5 + instructions.length * 3);

        const categories = [];
        if (recipe.strCategory) categories.push(recipe.strCategory);
        if (recipe.strArea) categories.push(recipe.strArea);
        if (recipe.strTags) recipe.strTags.split(',').forEach(tag => tag.trim() && categories.push(tag.trim()));

        const meatIngredients = ['chicken', 'beef', 'pork', 'lamb', 'meat', 'fish', 'seafood', 'shrimp', 'bacon'];
        const isVegetarian = !ingredients.some(ing => meatIngredients.some(meat => ing.name.toLowerCase().includes(meat)));

        return {
            id: recipe.idMeal || fallbackId,
            title: recipe.strMeal,
            description: recipe.strInstructions ? recipe.strInstructions.substring(0, 200) + '...' : 'No description available.',
            image: recipe.strMealThumb,
            cookTime,
            servings: 4,
            difficulty,
            rating: (Math.random() * 2 + 3).toFixed(1),
            categories,
            dietaryCategories: isVegetarian ? ['vegetarian'] : [],
            ingredients,
            instructions,
            source: 'mealdb'
        };
    }

    return recipe;
}

/**
 * Check recipe record status for current user.
 * Tries backend first, falls back to localStorage for demo/external users.
 * @param {string} recipeId - Recipe ID
 */
async function checkRecipeRecordStatus(recipeId) {
    const user = getCurrentUser();
    if (!user) return;

    // Try backend first (works for registered users with DB records)
    try {
        const response = await fetch(`/api/recipe-records/${encodeURIComponent(recipeId)}/user/${encodeURIComponent(user.id)}/status`);
        if (response.ok) {
            const { rated, favorited, ratedCount } = await response.json();
            updateStarButton(rated, ratedCount);
            updateFavoriteButton(favorited);
            return;
        }
    } catch (error) {
        console.error('Backend recipe status check failed:', error);
    }

    // Fall back to localStorage for demo users or external recipe IDs
    try {
        const [ratings, favorites] = await Promise.all([getRatings(user.email), getFavorites(user.email)]);
        const rated = !!ratings[recipeId];
        const ratedCount = Object.values(ratings).length;
        const favorited = favorites.includes(recipeId);
        updateStarButton(rated, ratedCount);
        updateFavoriteButton(favorited);
    } catch (error) {
        console.error('Error checking recipe status from localStorage:', error);
    }
}

/**
 * Get the current signed-in user info from localStorage.
 * @returns {Object|null} { id, email, name, isDemo } or null
 */
function getCurrentUser() {
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    if (!userId) return null;
    return {
        id: userId,
        email: email || '',
        name: name || '',
        isDemo: String(userId).startsWith('demo-')
    };
}

/**
 * Get localStorage key for favorites, keyed by user email.
 * @param {string} email - User email
 * @returns {string} localStorage key
 */
function getFavoritesKey(email) {
    return `recspicy_favorites_${email}`;
}

/**
 * Get localStorage key for ratings, keyed by user email.
 * @param {string} email - User email
 * @returns {string} localStorage key
 */
function getRatingsKey(email) {
    return `recspicy_ratings_${email}`;
}

/**
 * Read favorites for a user from localStorage.
 * @param {string} email - User email
 * @returns {Promise<Array<string>>} Array of favorited recipe IDs
 */
async function getFavorites(email) {
    if (!email) return [];
    try {
        const raw = localStorage.getItem(getFavoritesKey(email));
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Error reading favorites:', e);
        return [];
    }
}

/**
 * Save favorites for a user to localStorage.
 * @param {string} email - User email
 * @param {Array<string>} favorites - Array of favorited recipe IDs
 */
async function saveFavorites(email, favorites) {
    if (!email) return;
    try {
        localStorage.setItem(getFavoritesKey(email), JSON.stringify(favorites));
    } catch (e) {
        console.error('Error saving favorites:', e);
    }
}

/**
 * Read ratings for a user from localStorage.
 * @param {string} email - User email
 * @returns {Promise<Object>} Map of recipeId → rating value
 */
async function getRatings(email) {
    if (!email) return {};
    try {
        const raw = localStorage.getItem(getRatingsKey(email));
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.error('Error reading ratings:', e);
        return {};
    }
}

/**
 * Save a rating for a user to localStorage.
 * @param {string} email - User email
 * @param {string} recipeId - Recipe ID
 * @param {number} rating - Rating value (1-5)
 */
async function saveRating(email, recipeId, rating) {
    if (!email) return;
    try {
        const ratings = await getRatings(email);
        ratings[recipeId] = rating;
        localStorage.setItem(getRatingsKey(email), JSON.stringify(ratings));
    } catch (e) {
        console.error('Error saving rating:', e);
    }
}

/**
 * Update star button UI.
 * @param {boolean} rated - Whether user rated
 * @param {number} count - Rating count
 */
function updateStarButton(rated, count) {
    const starIcon = document.getElementById('star-icon');
    const countBadge = document.getElementById('star-count');
    const label = document.getElementById('star-label');

    if (countBadge) countBadge.textContent = count || 0;
    if (rated) {
        if (starIcon) starIcon.textContent = '★';
        if (label) label.textContent = 'Rated';
    } else {
        if (starIcon) starIcon.textContent = '☆';
        if (label) label.textContent = 'Rate Recipe';
    }
}

/**
 * Update favorite button UI.
 * @param {boolean} favorited - Whether user favorited
 */
function updateFavoriteButton(favorited) {
    const heartIcon = document.getElementById('favorite-icon');
    const label = document.getElementById('favorite-label');

    if (favorited) {
        if (heartIcon) heartIcon.textContent = '♥';
        if (label) label.textContent = 'Remove from Favorites';
    } else {
        if (heartIcon) heartIcon.textContent = '♡';
        if (label) label.textContent = 'Add to Favorites';
    }
}

/**
 * Display recipe in the UI.
 * @param {Object} recipe - Recipe object
 */
async function displayRecipe(recipe) {
    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('recipe-time-value').textContent = `${recipe.cookTime || '?'} min`;
    document.getElementById('recipe-servings-value').textContent = recipe.servings || 4;
    document.getElementById('recipe-difficulty-value').textContent = capitalizeFirstLetter(recipe.difficulty || 'medium');
    document.getElementById('recipe-author-value').textContent = recipe.author?.name || 'Unknown';

    const recipeImage = document.getElementById('recipe-image');
    if (recipe.image && recipe.image.trim() !== '') {
        recipeImage.src = recipe.image;
        recipeImage.alt = recipe.title;
    } else {
        recipeImage.src = 'https://via.placeholder.com/800x400?text=No+Image';
        recipeImage.alt = 'No image available';
    }

    document.getElementById('recipe-description').textContent = recipe.description || 'No description available.';

    if (recipe.ingredients && recipe.ingredients.length > 0) {
        displayIngredients(recipe.ingredients);
        displayInstructions(recipe.instructions);
        displayTags(recipe);
    } else {
        displayIngredients(recipe.ingredients);
        displayInstructions(recipe.instructions);
        displayTags(recipe);
    }

    setupActionButtons(recipe);
}

/**
 * Display ingredients list.
 * @param {Array} ingredients - Ingredient objects
 */
function displayIngredients(ingredients) {
    const list = document.getElementById('ingredients-list');
    list.innerHTML = '';

    if (!ingredients || ingredients.length === 0) {
        list.innerHTML = '<li>No ingredients listed</li>';
        return;
    }

    ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        let text = '';

        if (typeof ingredient === 'string') {
            text = ingredient;
        } else if (ingredient.quantity) {
            text = `${ingredient.quantity} ${ingredient.name}`;
        } else if (ingredient.amount) {
            text = `${ingredient.amount || ''} ${ingredient.unit || ''} ${ingredient.name || ''}`.trim();
        } else {
            text = ingredient.name || '';
        }

        li.textContent = text;
        list.appendChild(li);
    });
}

/**
 * Display instructions list.
 * @param {Array} instructions - Instruction objects
 */
function displayInstructions(instructions) {
    const list = document.getElementById('instructions-list');
    list.innerHTML = '';

    if (!instructions || instructions.length === 0) {
        list.innerHTML = '<li>No instructions provided</li>';
        return;
    }

    const sorted = [...instructions].sort((a, b) => (a.step || 0) - (b.step || 0));
    sorted.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = typeof instruction === 'string' ? instruction : (instruction.instruction || instruction.text || '');
        list.appendChild(li);
    });
}

/**
 * Display recipe tags.
 * @param {Object} recipe - Recipe object
 */
function displayTags(recipe) {
    const container = document.getElementById('recipe-tags');
    container.innerHTML = '';

    const categories = [...(recipe.categories || []), ...(recipe.dietaryCategories || []), ...(recipe.mealTypes || [])];
    categories.slice(0, 5).forEach(category => {
        const tag = document.createElement('span');
        tag.className = 'recipe-tag';
        tag.textContent = category;
        container.appendChild(tag);
    });

    const difficulty = document.createElement('span');
    difficulty.className = 'recipe-tag';
    difficulty.textContent = capitalizeFirstLetter(recipe.difficulty || 'medium');
    container.appendChild(difficulty);
}

/**
 * Set up action buttons (rate, favorite, print).
 * Supports demo users via localStorage fallback and external recipe IDs.
 * @param {Object} recipe - Recipe object
 */
function setupActionButtons(recipe) {
    const starBtn = document.getElementById('star-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const printBtn = document.getElementById('print-btn');

    const user = getCurrentUser();
    const recipeKey = String(recipe.id);

    // ---- Rate Recipe ----
    if (starBtn) {
        starBtn.onclick = async () => {
            if (!user) {
                showToast('Please log in to rate recipes');
                return;
            }

            let rated = false;
            let ratedCount = 0;

            try {
                const response = await fetch(`/api/recipe-records/${encodeURIComponent(recipeKey)}/rate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id })
                });

                if (response.ok) {
                    const data = await response.json();
                    rated = data.rated;
                    ratedCount = data.ratedCount;
                    showToast(data.message || 'Rating saved');
                    updateStarButton(rated, ratedCount);
                    return;
                }
            } catch (error) {
                console.error('Backend rate failed:', error);
            }

            // Fall back to localStorage for demo users or external recipe IDs
            try {
                const ratings = await getRatings(user.email);
                const wasRated = !!ratings[recipeKey];
                rated = !wasRated;
                if (rated) {
                    ratings[recipeKey] = 5;
                } else {
                    delete ratings[recipeKey];
                }
                await saveRating(user.email, recipeKey, rated ? 5 : undefined);
                ratedCount = Object.values(ratings).filter(Boolean).length;
                updateStarButton(rated, ratedCount);
                showToast(rated ? 'Rated 5 stars!' : 'Rating removed');
            } catch (error) {
                console.error('Error rating recipe:', error);
                showToast('Error rating recipe');
            }
        };
    }

    // ---- Add to Favorites ----
    if (favoriteBtn) {
        favoriteBtn.onclick = async () => {
            if (!user) {
                showToast('Please sign in to add favorites');
                return;
            }

            let isFavorite = false;

            try {
                const userResponse = await fetch(`/api/users/${encodeURIComponent(user.id)}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    let favorites = userData.profileData?.favorites || [];
                    isFavorite = favorites.includes(recipeKey);
                    const updatedFavorites = isFavorite
                        ? favorites.filter(id => id !== recipeKey)
                        : [...favorites, recipeKey];

                    const updateResponse = await fetch(`/api/users/${encodeURIComponent(user.id)}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({ favorites: updatedFavorites })
                    });

                    if (updateResponse.ok) {
                        updateFavoriteButton(!isFavorite);
                        showToast(!isFavorite ? 'Added to favorites!' : 'Removed from favorites!');
                        return;
                    }
                }
            } catch (error) {
                console.error('Backend favorites failed:', error);
            }

            // Fall back to localStorage
            try {
                const favorites = await getFavorites(user.email);
                isFavorite = favorites.includes(recipeKey);
                const updatedFavorites = isFavorite
                    ? favorites.filter(id => id !== recipeKey)
                    : [...favorites, recipeKey];
                await saveFavorites(user.email, updatedFavorites);
                updateFavoriteButton(!isFavorite);
                showToast(!isFavorite ? 'Added to favorites!' : 'Removed from favorites!');
            } catch (e) {
                console.error('Favorites fallback failed:', e);
                showToast('Failed to update favorites');
            }
        };
    }

    if (printBtn) {
        printBtn.onclick = () => printRecipe(recipe);
    }
}

/**
 * Print recipe.
 * @param {Object} recipe - Recipe object
 */
window.printRecipe = function(recipe) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Please allow popups to print recipes');
      return;
    }

    const origin = window.location.origin;
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${recipe.title} - Recspicy</title>
            <link rel="stylesheet" href="${origin}/css/styles.css">
            <link rel="stylesheet" href="${origin}/css/print.css">
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .print-header img { max-height: 50px; }
                .recipe-image { max-width: 100%; height: auto; max-height: 300px; object-fit: cover; margin-bottom: 20px; }
                .recipe-meta { margin: 10px 0; color: #666; }
                .ingredient-list, .instructions-list { margin: 10px 0; padding-left: 20px; }
                .recipe-image { max-width: 100%; height: auto; max-height: 300px; object-fit: cover; margin-bottom: 20px; }
                .recipe-meta { margin: 10px 0; color: #666; }
                .ingredient-list, .instructions-list { margin: 10px 0; padding-left: 20px; }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>${recipe.title}</h1>
                <p>Printed from Recspicy | ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="recipe-detail">
                ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">` : ''}
                
                <div class="recipe-content">
                    <p class="recipe-description">${recipe.description || ''}</p>
                    
                    <div class="recipe-meta">
                        <span>Prep Time: ${recipe.cookTime || '?'} min</span> | 
                        <span>Difficulty: ${capitalizeFirstLetter(recipe.difficulty || 'Medium')}</span> | 
                        <span>Rating: ${recipe.rating || '?'}</span> | 
                        <span>Servings: ${recipe.servings || 4}</span>
                    </div>

                    <h3>Ingredients</h3>
                    <ul class="ingredient-list">
                        ${(recipe.ingredients || []).map(ing => `<li>${typeof ing === 'string' ? ing : `${ing.quantity || ''} ${ing.name || ''}`}</li>`).join('')}
                    </ul>

                    <h3>Instructions</h3>
                    <ol class="instructions-list">
                        ${(recipe.instructions || []).map(inst => `<li>${typeof inst === 'string' ? inst : (inst.instruction || inst.text || '')}</li>`).join('')}
                    </ol>

                </div>
            </div>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    const doPrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (e) {
        console.warn('Print failed:', e);
      } finally {
        setTimeout(() => {
          try { printWindow.close(); } catch (e) {}
        }, 300);
      }
    };

    setTimeout(doPrint, 300);
  };

  /**
   * Show error message.
 * @param {string} message - Error message
 */
function showError(message) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    if (errorContainer && errorMessage) {
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
        setTimeout(() => { errorContainer.style.display = 'none'; }, 5000);
    }
}

/**
 * Show toast message.
 * @param {string} message - Toast message
 */
function showToast(message) {
    const toast = document.getElementById('toast-message');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

/**
 * Capitalize first letter.
 * @param {string} string - Input string
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Show loading indicator.
 * @param {string} message - Loading message
 */
function showLoading(message) {
    console.log(message);
}

/**
 * Hide loading indicator.
 */
function hideLoading() {
    // Implement loading hide if needed
}
