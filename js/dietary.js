document.addEventListener('DOMContentLoaded', () => {
    const categoryCards = document.querySelectorAll('.category-card');
    const timeFilter = document.getElementById('time-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    let activeCategory = null;
    let currentFilters = {
        time: 'all',
        difficulty: 'all'
    };

    categoryCards.forEach(card => {
        card.addEventListener('click', () => 
		{
            const category = card.dataset.category;
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            if (activeCategory !== category) 
			{
                activeCategory = category;
                loadRecipesByDiet(category, currentFilters);
            }
        });
    });

    timeFilter.addEventListener('change', updateFilters);
    difficultyFilter.addEventListener('change', updateFilters);
    document.querySelector('[data-category="vegetarian"]').click();
});

function updateFilters() {
    currentFilters = {
        time: timeFilter.value,
        difficulty: difficultyFilter.value
    };
    
    if (activeCategory) {
        loadRecipesByDiet(activeCategory, currentFilters);
    }
}

async function loadRecipesByDiet(category, filters) {
    try {
        const recipes = await fetchRecipesByDiet(category, filters);
        displayRecipes(recipes);
        updateSectionTitle(category);
    } catch (error) {
        console.error('Error loading recipes:', error);
        showError('Failed to load recipes');
    }
}

function displayRecipes(recipes) {
    const recipeGrid = document.getElementById('recipe-grid');
    
    recipeGrid.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-meta">
                    <span class="meta-item">
                        <i class="meta-icon">⏱️</i>
                        ${recipe.cookTime} mins
                    </span>
                    <span class="meta-item">
                        <i class="meta-icon">⭐</i>
                        ${recipe.rating.toFixed(1)}
                    </span>
                </div>
                <div class="recipe-tags">
                    ${recipe.tags.map(tag => `
                        <span class="recipe-tag">${tag}</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function updateSectionTitle(category) {
    const sectionTitle = document.querySelector('.section-title');
    const titles = {
        vegetarian: 'Vegetarian Recipes',
        vegan: 'Vegan Recipes',
        'gluten-free': 'Gluten-Free Recipes',
        'dairy-free': 'Dairy-Free Recipes',
        keto: 'Keto Recipes',
        paleo: 'Paleo Recipes'
    };
    
    sectionTitle.textContent = titles[category] || 'Selected Recipes';
}

function showError(message) {
    const recipeGrid = document.getElementById('recipe-grid');
    recipeGrid.innerHTML = `
        <div class="error-message">
            ${message}
        </div>
    `;
}

// Mock API
async function fetchRecipesByDiet(category, filters) 
{
    return [
        {
            title: 'Quinoa Buddha Bowl',
            image: 'https://source.unsplash.com/300x200/?buddhabowl',
            cookTime: 25,
            rating: 4.7,
            tags: ['High Protein', 'Gluten Free']
        },
        {
            title: 'Chickpea Curry',
            image: 'https://source.unsplash.com/300x200/?curry',
            cookTime: 35,
            rating: 4.6,
            tags: ['Spicy', 'High Protein']
        },
    ];
} 