document.addEventListener('DOMContentLoaded', async () => {
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = 'signin.html';
        return;
    }

    try {
        // Load user profile
        const profile = await ProfileService.getUserProfile(username);
        updateProfileUI(profile);

        // Load user's recipes
        const recipes = await RecipeService.getUserRecipes(username);
        updateRecipeGrid(recipes);

        // Load favorites
        const favorites = await ProfileService.getFavorites();
        updateFavoritesList(favorites);

        // Setup WebSocket listeners for real-time updates
        WebSocketService.on('recipe_rated', handleRecipeRated);
        WebSocketService.on('recipe_favorited', handleRecipeFavorited);
        WebSocketService.on('profile_updated', handleProfileUpdated);
    } catch (error) {
        console.error('Error loading profile:', error);
    }
});

function updateProfileUI(profile) {
    document.getElementById('profile-name').textContent = 
        `${profile.firstName} ${profile.lastName}`;
    document.getElementById('username').textContent = `@${profile.username}`;
    document.getElementById('bio').textContent = profile.bio || 'No bio available.';
    if (profile.profilePicture) {
        document.getElementById('profile-picture').src = profile.profilePicture;
    }
}

function updateRecipeGrid(recipes) {
    const grid = document.getElementById('recipe-grid');
    grid.innerHTML = recipes.map(recipe => `
        <div class="recipe-card bg-white rounded-lg shadow p-4">
            <img src="${recipe.image}" alt="${recipe.title}" class="w-full h-48 object-cover rounded-lg mb-4">
            <h3 class="text-lg font-bold">${recipe.title}</h3>
            <div class="flex items-center mt-2">
                <div class="flex text-yellow-400">
                    ${generateStarRating(recipe.ratings.average)}
                </div>
                <span class="text-gray-600 ml-2">(${recipe.ratings.count})</span>
            </div>
            <button onclick="toggleFavorite('${recipe._id}')" class="favorite-btn mt-2">
                ${recipe.isFavorited ? '❤️' : '🤍'}
            </button>
        </div>
    `).join('');
}

async function toggleFavorite(recipeId) {
    try {
        const result = await RecipeService.toggleFavorite(recipeId);
        // Update UI
        const btn = document.querySelector(`button[onclick="toggleFavorite('${recipeId}')"]`);
        btn.textContent = result.favorited ? '❤️' : '🤍';
        
        // Notify other clients through WebSocket
        WebSocketService.send('recipe_favorited', { recipeId, favorited: result.favorited });
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}

// WebSocket handlers
function handleRecipeRated(data) {
    const { recipeId, newAverage, newCount } = data;
    // Update rating display in UI
    const ratingElement = document.querySelector(`[data-recipe-id="${recipeId}"] .rating`);
    if (ratingElement) {
        ratingElement.innerHTML = generateStarRating(newAverage);
        ratingElement.nextElementSibling.textContent = `(${newCount})`;
    }
}

function handleRecipeFavorited(data) {
    const { recipeId, favorited } = data;
    const btn = document.querySelector(`button[onclick="toggleFavorite('${recipeId}')"]`);
    if (btn) {
        btn.textContent = favorited ? '❤️' : '🤍';
    }
}

function handleProfileUpdated(data) {
    updateProfileUI(data);
}

function generateStarRating(rating) {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}

function displayMealPlans(plans) {
    const container = document.getElementById('meal-plans');
    container.innerHTML = plans.map(plan => `
        <div class="bg-white rounded-lg shadow p-4">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-bold">${plan.name}</h3>
                <div class="flex space-x-2">
                    <button onclick="editMealPlan('${plan._id}')"
                            class="text-blue-600 hover:text-blue-800">
                        Edit
                    </button>
                    <button onclick="printMealPlan('${plan._id}')"
                            class="text-green-600 hover:text-green-800">
                        Print
                    </button>
                    <button onclick="deleteMealPlan('${plan._id}')"
                            class="text-red-600 hover:text-red-800">
                        Delete
                    </button>
                </div>
            </div>
            <div class="text-sm text-gray-600 mb-2">
                Week of ${new Date(plan.startDate).toLocaleDateString()}
            </div>
            <div class="grid grid-cols-7 gap-2 text-sm">
                ${Object.entries(plan.meals).map(([day, meals]) => `
                    <div>
                        <div class="font-medium">${day}</div>
                        ${Object.entries(meals).map(([mealType, recipe]) => `
                            <div class="text-gray-600">
                                ${mealType}: ${recipe.title}
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
} 