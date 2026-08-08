document.addEventListener('DOMContentLoaded', function() {
    let allRecipes = [];
    let displayedRecipes = [];
    let currentMealType = 'all';
    let currentDietary = 'all';
    let currentAllergy = 'none';
    let currentSource = 'all';
    let currentSearch = '';
    const recipesPerPage = 12;
    let currentPage = 1;
    let isLoading = false;

    const recipesContainer = document.getElementById('recipes-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const resultsTitle = document.getElementById('results-title');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');

    const mealTypeBtns = document.querySelectorAll('#meal-type-filters .filter-btn');
    const dietaryBtns = document.querySelectorAll('#dietary-filters .filter-btn');
    const allergyBtns = document.querySelectorAll('#allergy-filters .filter-btn');
    const sourceBtns = document.querySelectorAll('.source-btn');

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('filter')) {
        currentMealType = urlParams.get('filter');
        currentSearch = urlParams.get('search') || '';
    }
    if (urlParams.has('source')) {
        currentSource = urlParams.get('source');
    }
    if (searchInput && currentSearch) {
        searchInput.value = currentSearch;
    }

    async function loadRecipes() {
        if (isLoading) return;
        isLoading = true;
        currentPage = 1;
        
        recipesContainer.innerHTML = '<div class="loading-spinner"></div>';
        noResults.style.display = 'none';
        loadMoreBtn.style.display = 'none';

        try {
            let recipes = [];

            if (currentSource === 'edamam') {
                const query = currentSearch || 'recipe';
                const edamamRecipes = await window.recipeApi.searchEdamamRecipes(query, getEdamamFilters());
                recipes = edamamRecipes;
            } else if (currentSource === 'local') {
                recipes = await window.recipeApi.fetchLocalPublicRecipes();
            } else if (currentSource === 'mealdb') {
                recipes = await window.recipeApi.fetchMealdbAllCategories();
            } else {
                const [mealdb, local, edamam] = await Promise.all([
                    currentSearch ? Promise.resolve([]) : window.recipeApi.fetchMealdbAllCategories(),
                    window.recipeApi.fetchLocalPublicRecipes(),
                    window.recipeApi.searchEdamamRecipes(currentSearch || 'recipe', getEdamamFilters())
                ]);
                recipes = [...mealdb, ...local, ...edamam];
            }

            const seen = new Set();
            allRecipes = recipes.filter(recipe => {
                if (seen.has(recipe.id)) return false;
                seen.add(recipe.id);
                return true;
            });

            applyFilters();
        } catch (error) {
            console.error('Error loading recipes:', error);
            recipesContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load recipes. Please try again later.</p>
                </div>
            `;
        } finally {
            isLoading = false;
        }
    }

    function getEdamamFilters() {
        const filters = {};
        if (currentDietary !== 'all') {
            filters.diet = currentDietary;
        }
        if (currentAllergy !== 'none') {
            filters.excluded = currentAllergy;
        }
        if (currentMealType !== 'all') {
            filters.mealType = currentMealType;
        }
        return filters;
    }

    function applyFilters() {
        let filtered = [...allRecipes];

        if (currentSearch) {
            const query = currentSearch.toLowerCase();
            filtered = filtered.filter(recipe => 
                recipe.title.toLowerCase().includes(query) ||
                recipe.description.toLowerCase().includes(query) ||
                recipe.categories.some(cat => cat.toLowerCase().includes(query))
            );
        }

        if (currentMealType !== 'all') {
            filtered = filtered.filter(recipe => {
                const mealTypes = recipe.mealTypes || [];
                return mealTypes.some(mt => mt.toLowerCase() === currentMealType.toLowerCase()) ||
                       recipe.categories.some(cat => cat.toLowerCase() === currentMealType.toLowerCase());
            });
        }

        if (currentDietary !== 'all') {
            filtered = filtered.filter(recipe => {
                const dietary = recipe.dietaryCategories || [];
                return dietary.includes(currentDietary);
            });
        }

        if (currentAllergy !== 'none') {
            filtered = filtered.filter(recipe => {
                const allergens = recipe.allergens || [];
                return !allergens.includes(currentAllergy);
            });
        }

        displayedRecipes = filtered;
        currentPage = 1;
        displayRecipes();
    }

    function displayRecipes() {
        const startIndex = 0;
        const endIndex = currentPage * recipesPerPage;
        const recipesToShow = displayedRecipes.slice(startIndex, endIndex);

        const titles = {
            'all': 'All Recipes',
            'Breakfast': 'Breakfast Recipes',
            'Brunch': 'Brunch Recipes',
            'Lunch': 'Lunch Recipes',
            'Dinner': 'Dinner Recipes',
            'Snack': 'Snack Recipes',
            'Dessert': 'Dessert Recipes',
            'Side': 'Side Dishes',
            'Appetizer': 'Appetizers',
            'Beverage': 'Beverages'
        };

        let title = titles[currentMealType] || 'All Recipes';
        if (currentDietary !== 'all') {
            title += ` (${currentDietary.charAt(0).toUpperCase() + currentDietary.slice(1)})`;
        }
        if (currentAllergy !== 'none') {
            title += ` (No ${currentAllergy.replace('_', ' ')})`;
        }

        resultsTitle.textContent = title;
        resultsCount.textContent = `${displayedRecipes.length} recipe${displayedRecipes.length !== 1 ? 's' : ''}`;

        if (displayedRecipes.length === 0) {
            recipesContainer.innerHTML = '';
            noResults.style.display = 'block';
            loadMoreBtn.style.display = 'none';
            return;
        }

        noResults.style.display = 'none';
        recipesContainer.innerHTML = recipesToShow.map(recipe => createRecipeCard(recipe)).join('');
        loadMoreBtn.style.display = endIndex >= displayedRecipes.length ? 'none' : 'block';
    }

    function createRecipeCard(recipe) {
        const imageUrl = recipe.image || 'https://via.placeholder.com/300x200?text=No+Image';
        const title = recipe.title;
        const category = recipe.categories[0] || '';
        const difficulty = recipe.difficulty || 'Medium';
        const cookTime = recipe.cookTime || 30;
        const source = recipe.source === 'local' ? 'Community' : recipe.source === 'edamam' ? 'Edamam' : 'TheMealDB';
        const mealTypes = recipe.mealTypes || [];
        const allergens = recipe.allergens || [];
        const dietary = recipe.dietaryCategories || [];

        const mealTypeBadges = mealTypes.slice(0, 2).map(mt => 
            `<span class="recipe-badge meal-type-badge">${mt}</span>`
        ).join('');

        const dietaryBadges = dietary.slice(0, 2).map(d => 
            `<span class="recipe-badge dietary-badge">${d}</span>`
        ).join('');

        const allergenBadges = allergens.slice(0, 2).map(a => 
            `<span class="recipe-badge allergen-badge">${a.replace('_', ' ')}</span>`
        ).join('');

        return `
            <div class="recipe-card" data-recipe-id="${recipe.id}">
                <div class="recipe-card-image">
                    <img src="${imageUrl}" alt="${title}" class="recipe-image" loading="lazy">
                    ${category ? `<span class="recipe-card-category">${category}</span>` : ''}
                    <span class="recipe-card-source">${source}</span>
                </div>
                <div class="recipe-card-content">
                    <h3 class="recipe-card-title">${title}</h3>
                    <p class="recipe-card-description">${recipe.description ? recipe.description.substring(0, 100) + (recipe.description.length > 100 ? '...' : '') : ''}</p>
                    <div class="recipe-card-badges">
                        ${mealTypeBadges}
                        ${dietaryBadges}
                        ${allergenBadges}
                    </div>
                    <div class="recipe-card-meta">
                        <span>${cookTime} min</span>
                        <span>${difficulty}</span>
                    </div>
                    <a href="recipes.html?id=${recipe.id}" class="btn btn-primary btn-sm btn-block">View Recipe</a>
                </div>
            </div>
        `;
    }

    function setActiveButton(buttons, activeBtn) {
        buttons.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    function syncFilterUI() {
        mealTypeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === currentMealType);
        });
        dietaryBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === currentDietary);
        });
        allergyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === currentAllergy);
        });
        sourceBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.source === currentSource);
        });
        if (searchInput && currentSearch) {
            searchInput.value = currentSearch;
        }
    }

    mealTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            setActiveButton(mealTypeBtns, this);
            currentMealType = this.dataset.filter;
            currentPage = 1;
            applyFilters();
        });
    });

    dietaryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            setActiveButton(dietaryBtns, this);
            currentDietary = this.dataset.filter;
            currentPage = 1;
            applyFilters();
        });
    });

    allergyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            setActiveButton(allergyBtns, this);
            currentAllergy = this.dataset.filter;
            currentPage = 1;
            applyFilters();
        });
    });

    sourceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sourceBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSource = this.dataset.source;
            loadRecipes();
        });
    });

    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = this.value.trim();
            currentPage = 1;
            applyFilters();
        }, 300);
    });

    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        applyFilters();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            applyFilters();
        }
    });

    loadMoreBtn.addEventListener('click', function() {
        currentPage++;
        displayRecipes();
    });

    syncFilterUI();
    loadRecipes();
});
