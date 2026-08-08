/**
 * Home page controller.
 * Handles recipe loading, filtering, and section display.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadAllRecipes();
    initializeFilters();
});

/**
 * Load all recipe categories.
 */
async function loadAllRecipes() {
    try {
        const [trending, featured, recommended] = await Promise.all([
            fetchTrendingRecipes(),
            fetchFeaturedRecipes(),
            fetchRecommendedRecipes()
        ]);

        const allRecipes = [...trending, ...featured, ...recommended];
        const uniqueRecipes = removeDuplicates(allRecipes);

        displayRecipes('all-recipes', uniqueRecipes);
        displayRecipes('quick-recipes', filterRecipesByCategory(uniqueRecipes, 'quick'));
        displayRecipes('vegetarian-recipes', filterRecipesByCategory(uniqueRecipes, 'vegetarian'));
        displayRecipes('trending-recipes', filterRecipesByCategory(uniqueRecipes, 'trending'));
        displayRecipes('popular-recipes', filterRecipesByCategory(uniqueRecipes, 'popular'));
    } catch (error) {
        console.error('Error loading recipes:', error);
        showError('all-recipes');
    }
}

/**
 * Remove duplicate recipes by ID.
 * @param {Array} recipes - Recipe array
 * @returns {Array} Unique recipes
 */
function removeDuplicates(recipes) {
    const seen = new Set();
    return recipes.filter(recipe => {
        if (seen.has(recipe.id)) return false;
        seen.add(recipe.id);
        return true;
    });
}

/**
 * Initialize filter buttons.
 */
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.dataset.filter;
            showSection(filter);
        });
    });

    const searchInput = document.getElementById('recipe-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterBySearch(query);
        });
    }
}

/**
 * Show section by filter.
 * @param {string} filter - Filter name
 */
function showSection(filter) {
    const sections = document.querySelectorAll('.recipe-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const targetSection = document.getElementById(`section-${filter}`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

/**
 * Display recipes in container.
 * @param {string} containerId - Container ID
 * @param {Array} recipes - Recipe array
 */
function displayRecipes(containerId, recipes) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!recipes || recipes.length === 0) {
        container.innerHTML = '<p class="no-recipes">No recipes found</p>';
        return;
    }

    container.innerHTML = recipes.map(recipe => {
        const categories = [
            ...(recipe.categories || []),
            ...(recipe.dietaryCategories || []),
            ...(recipe.mealTypes || [])
        ];

        return `
            <div class="recipe-card"
                 data-categories="${categories.join(' ')}"
                 data-recipe-id="${recipe.id}">
                <img src="${recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}"
                     alt="${recipe.title}"
                     class="recipe-image"
                     loading="lazy">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <p class="recipe-description">${recipe.description || ''}</p>
                    <div class="recipe-meta">
                        <span class="recipe-time">&#128336; ${recipe.cookTime || '?'} min</span>
                        <span class="recipe-difficulty">&#128170; ${recipe.difficulty || 'Medium'}</span>
                        <span class="recipe-rating">&#11088; ${recipe.rating || '?'}</span>
                    </div>
                    <div class="recipe-tags">
                        ${categories.slice(0, 3).map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.recipe-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const recipeId = card.dataset.recipeId;
            if (recipeId) {
                window.location.href = `recipes.html?id=${recipeId}`;
            }
        });
    });
}

/**
 * Filter recipes by search query.
 * @param {string} query - Search query
 */
function filterBySearch(query) {
    const sections = document.querySelectorAll('.recipe-section');
    sections.forEach(section => {
        const cards = section.querySelectorAll('.recipe-card');
        cards.forEach(card => {
            const title = card.querySelector('.recipe-title')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.recipe-description')?.textContent.toLowerCase() || '';
            const categories = card.dataset.categories?.toLowerCase() || '';

            if (title.includes(query) || description.includes(query) || categories.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

/**
 * Filter recipes by category.
 * @param {Array} recipes - Recipe array
 * @param {string} filter - Filter name
 * @returns {Array} Filtered recipes
 */
function filterRecipesByCategory(recipes, filter) {
    if (filter === 'all') return recipes;

    return recipes.filter(recipe => {
        const categories = [
            ...(recipe.categories || []),
            ...(recipe.dietaryCategories || []),
            ...(recipe.mealTypes || [])
        ];

        if (filter === 'quick') {
            return (recipe.cookTime || 0) <= 30;
        }

        if (filter === 'vegetarian') {
            return recipe.dietaryCategories?.includes('vegetarian') ||
                   categories.some(cat => /vegetarian|vegan|plant/i.test(cat));
        }

        if (filter === 'trending') {
            return (recipe.rating || 0) >= 4.0 || categories.some(cat => /trending|popular|new/i.test(cat));
        }

        if (filter === 'popular') {
            return (recipe.rating || 0) >= 4.2;
        }

        return categories.some(cat => cat.toLowerCase() === filter.toLowerCase());
    });
}

/**
 * Show error message.
 * @param {string} containerId - Container ID
 */
function showError(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                Failed to load recipes. Please try again later.
            </div>
        `;
    }
}
