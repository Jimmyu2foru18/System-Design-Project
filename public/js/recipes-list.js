/**
 * Recipes list controller.
 * Handles recipe browsing, filtering, search, and pagination.
 */

document.addEventListener('DOMContentLoaded', function() {
    const recipesContainer = document.getElementById('recipes-container');
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');

    let currentPage = 1;
    let currentFilter = 'all';
    let currentSearch = '';
    let allRecipes = [];
    let filteredRecipes = [];
    const recipesPerPage = 12;

    fetchRecipes();
    setupEventListeners();

    /**
     * Fetch recipes based on current state.
     */
    async function fetchRecipes() {
        recipesContainer.innerHTML = '<div class="loading-spinner"></div>';

        try {
            let recipes = [];

            if (currentSearch) {
                recipes = await searchRecipes(currentSearch);
            } else if (currentFilter !== 'all') {
                recipes = await getRecipesByCategory(currentFilter);
            } else {
                recipes = await fetchAllPublicRecipes();
            }

            allRecipes = recipes;
            applyFiltersAndSort();
        } catch (error) {
            showError('Error loading recipes: ' + error.message);
        }
    }

    /**
     * Fetch all public recipes by browsing categories.
     * @returns {Array} All public recipes
     */
    async function fetchAllPublicRecipes() {
        const categories = ['Beef', 'Chicken', 'Dessert', 'Lamb', 'Miscellaneous', 'Pasta', 'Pork', 'Seafood', 'Side', 'Starter', 'Vegan', 'Vegetarian', 'Breakfast', 'Goat'];
        const recipes = [];
        const seen = new Set();

        for (const category of categories) {
            try {
                const categoryRecipes = await getRecipesByCategory(category);
                categoryRecipes.forEach(recipe => {
                    const id = recipe.id || recipe.idMeal;
                    if (!seen.has(id)) {
                        seen.add(id);
                        recipes.push(recipe);
                    }
                });
            } catch (error) {
                console.error(`Error fetching ${category} recipes:`, error);
            }
        }

        return recipes;
    }

    /**
     * Apply filters and search to recipes.
     */
    function applyFiltersAndSort() {
        filteredRecipes = allRecipes.filter(recipe => {
            const title = (recipe.title || recipe.strMeal || '').toLowerCase();
            const categories = [
                ...(recipe.categories || []),
                ...(recipe.dietaryCategories || []),
                ...(recipe.mealTypes || [])
            ];

            if (currentSearch && !title.includes(currentSearch.toLowerCase())) {
                return false;
            }

            if (currentFilter !== 'all') {
                const matchesCategory = categories.some(cat => cat.toLowerCase() === currentFilter.toLowerCase());
                const matchesApiCategory = (recipe.strCategory || '').toLowerCase() === currentFilter.toLowerCase();
                if (!matchesCategory && !matchesApiCategory) return false;
            }

            return true;
        });

        currentPage = 1;
        displayRecipes();
    }

    /**
     * Display recipes with pagination.
     */
    function displayRecipes() {
        recipesContainer.innerHTML = '';

        const startIndex = (currentPage - 1) * recipesPerPage;
        const endIndex = startIndex + recipesPerPage;
        const recipesToShow = filteredRecipes.slice(startIndex, endIndex);

        if (recipesToShow.length === 0) {
            recipesContainer.innerHTML = `
                <div class="no-results">
                    <h3>No recipes found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            loadMoreBtn.style.display = 'none';
            return;
        }

        recipesToShow.forEach(recipe => {
            const card = createRecipeCard(recipe);
            recipesContainer.appendChild(card);
        });

        loadMoreBtn.style.display = endIndex >= filteredRecipes.length ? 'none' : 'block';
    }

    /**
     * Create recipe card element.
     * @param {Object} recipe - Recipe object
     * @returns {HTMLElement} Recipe card element
     */
    function createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';

        const imageUrl = recipe.strMealThumb || recipe.image || 'https://via.placeholder.com/300x200?text=No+Image';
        const title = recipe.strMeal || recipe.title || 'Untitled Recipe';
        const category = recipe.strCategory || (recipe.categories && recipe.categories[0]) || '';

        card.innerHTML = `
            <div class="recipe-card-image">
                <img src="${imageUrl}" alt="${title}" class="recipe-image" loading="lazy">
                ${category ? `<span class="recipe-card-category">${category}</span>` : ''}
            </div>
            <div class="recipe-card-content">
                <h3 class="recipe-card-title">${title}</h3>
                <p class="recipe-card-description">${recipe.description ? recipe.description.substring(0, 100) + (recipe.description.length > 100 ? '...' : '') : ''}</p>
                <div class="recipe-card-footer">
                    <span class="recipe-card-id">ID: ${recipe.idMeal || recipe.id}</span>
                    <a href="recipes.html?id=${recipe.idMeal || recipe.id}" class="btn btn-primary btn-sm">View Recipe</a>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Set up event listeners.
     */
    function setupEventListeners() {
        // Search with debounce
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = this.value.trim();
                fetchRecipes();
            }, 300);
        });

        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                currentSearch = '';
                searchInput.value = '';
                fetchRecipes();
            });
        });

        // Load more
        loadMoreBtn.addEventListener('click', function() {
            currentPage++;
            displayRecipes();
        });
    }

    /**
     * Show error message.
     * @param {string} message - Error message
     */
    function showError(message) {
        if (errorContainer && errorMessage) {
            errorMessage.textContent = message;
            errorContainer.style.display = 'block';
            recipesContainer.innerHTML = '';
        }
    }
});
