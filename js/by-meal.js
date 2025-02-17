document.addEventListener('DOMContentLoaded', () => {
    const categoryCards = document.querySelectorAll('.category-card');
    let activeCategory = null;

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
			
            if (activeCategory !== category) 
			{
                activeCategory = category;
                loadRecipesByMeal(category);
            }
        });
    });
    document.querySelector('[data-category="breakfast"]').click();
});

async function loadRecipesByMeal(category) {
    try {
        const recipes = await fetchRecipesByMeal(category);
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
            </div>
        </div>
    `).join('');
}

function updateSectionTitle(category) {
    const sectionTitle = document.querySelector('.section-title');
    const titles = {
        breakfast: 'Breakfast Recipes',
        lunch: 'Lunch Recipes',
        dinner: 'Dinner Recipes',
        appetizers: 'Appetizer Recipes',
        snacks: 'Snack Recipes',
        desserts: 'Dessert Recipes'
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
async function fetchRecipesByMeal(category) {
    return [
        {
            title: 'Classic French Toast',
            image: 'https://source.unsplash.com/300x200/?frenchtoast',
            cookTime: 20,
            rating: 4.8
        },
        {
            title: 'Avocado Toast',
            image: 'https://source.unsplash.com/300x200/?avocadotoast',
            cookTime: 10,
            rating: 4.5
        },
        // Add more mock recipes...
    ];
} 