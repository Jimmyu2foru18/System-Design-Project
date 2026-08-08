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
 * Fetch recipe data from API.
 * @param {string} id - Recipe ID
 */
async function fetchRecipe(id) {
    try {
        showLoading('Loading recipe...');

        const response = await fetch(`/api/recipes/${id}`, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const recipe = await response.json();
            await checkRecipeRecordStatus(id);
            displayRecipe(recipe);
            hideLoading();
            return;
        }

        // Fallback to user recipes
        const userId = localStorage.getItem('userId');
        if (userId) {
            const userResponse = await fetch(`/api/users/${userId}/recipes/${id}`);
            if (userResponse.ok) {
                const recipe = await userResponse.json();
                await checkRecipeRecordStatus(id);
                displayRecipe(recipe);
                hideLoading();
                return;
            }
        }

        // Fallback to global lookup
        if (typeof getRecipeById === 'function') {
            const recipe = await getRecipeById(id);
            if (recipe) {
                await checkRecipeRecordStatus(id);
                displayRecipe(recipe);
                hideLoading();
                return;
            }
        }

        throw new Error('Recipe not found');
    } catch (error) {
        console.error('Error loading recipe:', error);
        showError('Error loading recipe: ' + error.message);
        hideLoading();
    }
}

/**
 * Check recipe record status for current user.
 * @param {string} recipeId - Recipe ID
 */
async function checkRecipeRecordStatus(recipeId) {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const response = await fetch(`/api/recipe-records/${recipeId}/user/${userId}/status`);
        if (response.ok) {
            const { rated, favorited, ratedCount } = await response.json();
            updateStarButton(rated, ratedCount);
            updateFavoriteButton(favorited);
        }
    } catch (error) {
        console.error('Error checking recipe status:', error);
    }
}

/**
 * Update star button UI.
 * @param {boolean} rated - Whether user rated
 * @param {number} count - Rating count
 */
function updateStarButton(rated, count) {
    const starIcon = document.querySelector('#star-btn i');
    const countBadge = document.getElementById('star-count');
    const label = document.querySelector('#star-btn span');

    if (countBadge) countBadge.textContent = count || 0;
    if (rated) {
        starIcon.classList.remove('far');
        starIcon.classList.add('fas');
        if (label) label.textContent = 'Rated';
    } else {
        starIcon.classList.remove('fas');
        starIcon.classList.add('far');
        if (label) label.textContent = 'Rate Recipe';
    }
}

/**
 * Update favorite button UI.
 * @param {boolean} favorited - Whether user favorited
 */
function updateFavoriteButton(favorited) {
    const heartIcon = document.querySelector('#favorite-btn i');
    const label = document.querySelector('#favorite-btn span');

    if (favorited) {
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
        if (label) label.textContent = 'Remove from Favorites';
    } else {
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
        if (label) label.textContent = 'Add to Favorites';
    }
}

/**
 * Display recipe in the UI.
 * @param {Object} recipe - Recipe object
 */
async function displayRecipe(recipe) {
    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('recipe-time').textContent = `${recipe.cookTime || '?'} min`;
    document.getElementById('recipe-servings').textContent = recipe.servings || 4;
    document.getElementById('recipe-difficulty').textContent = capitalizeFirstLetter(recipe.difficulty || 'medium');
    document.getElementById('recipe-author').textContent = recipe.author?.name || 'Unknown';

    const recipeImage = document.getElementById('recipe-image');
    if (recipe.image && recipe.image.trim() !== '') {
        recipeImage.src = recipe.image;
        recipeImage.alt = recipe.title;
    } else {
        recipeImage.src = 'https://via.placeholder.com/800x400?text=No+Image';
        recipeImage.alt = 'No image available';
    }

    document.getElementById('recipe-description').textContent = recipe.description || 'No description available.';

    displayIngredients(recipe.ingredients);
    displayInstructions(recipe.instructions);
    displayTags(recipe);

    // Calculate and display nutrition
    if (recipe.ingredients && recipe.ingredients.length > 0) {
        try {
            const nutrition = await calculateRecipeNutrition(recipe.ingredients);
            displayNutrition(nutrition);
        } catch (error) {
            console.error('Error calculating nutrition:', error);
        }
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
 * Display nutrition information.
 * @param {Object} nutrition - Nutrition data
 */
function displayNutrition(nutrition) {
    const container = document.getElementById('nutrition-facts');
    if (!container) return;

    container.innerHTML = `
        <div class="nutrition-item"><span class="nutrition-name">Calories</span><span class="nutrition-value">${nutrition.calories} kcal</span></div>
        <div class="nutrition-item"><span class="nutrition-name">Protein</span><span class="nutrition-value">${nutrition.protein}g</span></div>
        <div class="nutrition-item"><span class="nutrition-name">Fat</span><span class="nutrition-value">${nutrition.fat}g</span></div>
        <div class="nutrition-item"><span class="nutrition-name">Carbs</span><span class="nutrition-value">${nutrition.carbs}g</span></div>
        <div class="nutrition-item"><span class="nutrition-name">Fiber</span><span class="nutrition-value">${nutrition.fiber}g</span></div>
    `;
}

/**
 * Set up action buttons.
 * @param {Object} recipe - Recipe object
 */
function setupActionButtons(recipe) {
    const starBtn = document.getElementById('star-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const printBtn = document.getElementById('print-btn');

    if (starBtn) {
        starBtn.onclick = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                showToast('Please log in to rate recipes');
                return;
            }

            try {
                const response = await fetch(`/api/recipe-records/${recipe.id}/rate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });

                if (response.ok) {
                    const { rated, ratedCount, message } = await response.json();
                    updateStarButton(rated, ratedCount);
                    showToast(message);
                }
            } catch (error) {
                console.error('Error rating recipe:', error);
                showToast('Error rating recipe');
            }
        };
    }

    if (favoriteBtn) {
        favoriteBtn.onclick = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                showToast('Please sign in to add favorites');
                return;
            }

            try {
                const userResponse = await fetch(`/api/users/${userId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });

                if (!userResponse.ok) throw new Error('Failed to fetch user data');

                const userData = await userResponse.json();
                let favorites = userData.profileData?.favorites || [];
                const isFavorite = favorites.includes(recipe.id);
                const updatedFavorites = isFavorite
                    ? favorites.filter(id => id !== recipe.id)
                    : [...favorites, recipe.id];

                const updateResponse = await fetch(`/api/users/${userId}`, {
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
                }
            } catch (error) {
                console.error('Error updating favorites:', error);
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
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${recipe.title} - Recspicy</title>
            <link rel="stylesheet" href="css/styles.css">
            <link rel="stylesheet" href="css/print.css">
        </head>
        <body>
            <div class="print-header">
                <img src="images/logo.png" alt="Recspicy">
                <h1>${recipe.title}</h1>
                <p>Printed from Recspicy | ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="recipe-detail">
                ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">` : ''}
                
                <div class="recipe-content">
                    <h2>${recipe.title}</h2>
                    <p class="recipe-description">${recipe.description || ''}</p>
                    
                    <div class="recipe-meta">
                        <span>&#128336; ${recipe.cookTime || '?'} min</span>
                        <span>&#128170; ${capitalizeFirstLetter(recipe.difficulty || 'Medium')}</span>
                        <span>&#11088; ${recipe.rating || '?'}</span>
                        <span>&#127858; ${recipe.servings || 4} servings</span>
                    </div>

                    <h3>Ingredients</h3>
                    <ul class="ingredient-list">
                        ${(recipe.ingredients || []).map(ing => `<li>${typeof ing === 'string' ? ing : `${ing.quantity || ''} ${ing.name || ''}`}</li>`).join('')}
                    </ul>

                    <h3>Instructions</h3>
                    <ol class="instructions-list">
                        ${(recipe.instructions || []).map(inst => `<li>${typeof inst === 'string' ? inst : (inst.instruction || inst.text || '')}</li>`).join('')}
                    </ol>

                    <div id="print-nutrition"></div>
                </div>
            </div>
        </body>
        </html>
    `);

    if (recipe.ingredients && recipe.ingredients.length > 0) {
        calculateRecipeNutrition(recipe.ingredients).then(nutrition => {
            const nutritionEl = printWindow.document.getElementById('print-nutrition');
            if (nutritionEl) {
                nutritionEl.innerHTML = `
                    <h3>Nutrition Information (Estimated)</h3>
                    <div class="nutrition-info">
                        <span class="nutrition-item">&#128168; ${nutrition.calories} kcal</span>
                        <span class="nutrition-item">&#129358; ${nutrition.protein}g protein</span>
                        <span class="nutrition-item">&#129367; ${nutrition.fat}g fat</span>
                        <span class="nutrition-item">&#127804; ${nutrition.carbs}g carbs</span>
                        <span class="nutrition-item">&#127807; ${nutrition.fiber}g fiber</span>
                    </div>
                `;
            }
        });
    }

    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

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
