document.addEventListener('DOMContentLoaded', () => 
{
    loadTopRecipes('all-time');
    
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => 
	{
        button.addEventListener('click', () => 
		{
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadTopRecipes(button.dataset.category);
        });
    });
});




async function loadTopRecipes(category) 
{
    try 
	{
        const recipes = await fetchTopRecipes(category);
        displayRecipes(recipes);
        updateStats(recipes);
    } 
	catch (error) 
	{
        console.error('Error loading recipes:', error);
        showError('Failed to load recipes');
    }
}

function displayRecipes(recipes) 
{
    const recipesGrid = document.getElementById('recipes-grid');
    
    recipesGrid.innerHTML = recipes.map((recipe, index) => `
        <div class="recipe-card">
            <span class="recipe-rank">${index + 1}</span>
            <img src="${recipe.thumbnail}" alt="${recipe.title}">
            <div class="recipe-content">
                <h3>${recipe.title}</h3>
                <div class="recipe-stats">
                    <span>👥 ${recipe.servings}</span>
                    <span>⏱ ${recipe.total_time} mins</span>
                    <span>⭐ ${recipe.average_rating.toFixed(1)}</span>
                </div>
                <p class="recipe-description">${recipe.description}</p>
            </div>
        </div>
    `).join('');
}

function updateStats(recipes) 
{
    const totalRatings = recipes.reduce((sum, recipe) => sum + recipe.reviews, 0);
    const totalReviews = recipes.reduce((sum, recipe) => sum + recipe.reviews, 0);
    
    document.getElementById('total-ratings').textContent = totalRatings.toLocaleString();
    document.getElementById('total-reviews').textContent = totalReviews.toLocaleString();
}




function showError(message) 
{
    const recipesGrid = document.getElementById('recipes-grid');
    recipesGrid.innerHTML = 
	`
        <div class="error-message">
            ${message}
        </div>
    `;
}




//How to Write A Mock API


// Mock API function
async function fetchTopRecipes(category) {
    try {
        const response = await fetch(`/api/recipes/top?category=${category}`);
        if (!response.ok) throw new Error('Failed to load recipes');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
} 