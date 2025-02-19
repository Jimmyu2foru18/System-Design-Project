document.addEventListener('DOMContentLoaded', () => 
{
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (recipeId) 
	{
        loadRecipe(recipeId);
        setupEventListeners(recipeId);
    } 
	else 
	{
        showError('Recipe not found');
    }
});

let currentRecipe = null;

async function loadRecipe(recipeId) 
{
    try 
	{
        const recipe = await fetchRecipeDetails(recipeId);
        currentRecipe = recipe;
		
        updateRecipeUI(recipe);
        checkUserInteractions(recipeId);
    } 
	catch (error) 
	{
        console.error('Error loading recipe:', error);
        showError('Failed to load recipe');
    }
}



function updateRecipeUI(recipe) 
{
    document.getElementById('recipe-image').src = recipe.image;
    document.getElementById('recipe-image').alt = recipe.title;
	
    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('cook-time').textContent = `${recipe.cookTime} mins`;
	
    document.getElementById('servings').textContent = `${recipe.servings} servings`;
    document.getElementById('difficulty').textContent = recipe.difficulty;
	
    document.getElementById('recipe-description').textContent = recipe.description;
    document.getElementById('star-count').textContent = recipe.stars;

    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = recipe.ingredients.map(ingredient => 
        `<li>${ingredient}</li>`
    ).join('');






    const instructionsList = document.getElementById('instructions-list');
    instructionsList.innerHTML = recipe.instructions.map(instruction => 
        `<li>${instruction}</li>`
    ).join('');



    document.getElementById('recipe-notes').textContent = recipe.notes || 'No additional notes.';




    const nutritionFacts = document.getElementById('nutrition-facts');
    nutritionFacts.innerHTML = Object.entries(recipe.nutrition).map(([key, value]) => `
        <div class="nutrition-item">
            <span class="nutrition-label">${key}</span>
            <span class="nutrition-value">${value}${key === 'calories' ? '' : 'g'}</span>
        </div>
    `).join('');



    const tagsContainer = document.getElementById('recipe-tags');
    tagsContainer.innerHTML = recipe.tags.map(tag => 
        `<span class="recipe-tag">${tag}</span>`
    ).join('');
	
	
    document.title = `${recipe.title} - Recspicy`;
}





function setupEventListeners() 
{
    const starBtn = document.getElementById('star-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const printBtn = document.getElementById('print-btn');

    starBtn.addEventListener('click', () => toggleStar(currentRecipe.id));
    favoriteBtn.addEventListener('click', () => toggleFavorite(currentRecipe.id));
    printBtn.addEventListener('click', () => navigateToPrintPage(currentRecipe.id));
}



function navigateToPrintPage(recipeId) 
{
    window.location.href = `print-recipe.html?id=${recipeId}`;
}




async function checkUserInteractions(recipeId) 
{
    try 
	{
        const interactions = await fetchUserInteractions(recipeId);
        
        document.getElementById('star-btn').classList.toggle('active', interactions.starred);
        document.getElementById('favorite-btn').classList.toggle('active', interactions.favorited);
    } 
	catch (error) 
	{
        console.error('Error checking user interactions:', error);
    }
}

async function toggleStar(recipeId) 
{
    try 
	{
        const response = await fetch(`/api/recipes/${recipeId}/rate`, 
		{
            method: 'POST',
            headers: 
			{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(
			{
                rating: currentRating
            })
        });
        
        if (!response.ok) throw new Error('Rating failed');
        
        const data = await response.json();
        updateStarUI(data.newAverage);
    } 
	catch (error) 
	{
        showError('Could not save rating');
    }
}




async function toggleFavorite(recipeId) 
{
    const favoriteBtn = document.getElementById('favorite-btn');
    
    try 
	{
        const result = await updateRecipeFavorite(recipeId);
        favoriteBtn.classList.toggle('active');
        
        showToast(result.favorited ? 'Added to favorites!' : 'Removed from favorites');
    } 
	catch (error) 
	{
        console.error('Error updating favorite:', error);
        showError('Failed to update favorite');
    }
}



function showToast(message) 
{
    console.log(message);
}

function showError(message) 
{
    console.error(message);
}




async function fetchRecipeDetails(recipeId) 
{
    /* API INTEGRATION */
    const response = await fetch(`/api/recipes/${recipeId}`);
    return response.json();
}


async function fetchUserInteractions(recipeId) 
{
    await new Promise(resolve => setTimeout(resolve, 300));
    return 
	{
        starred: false,
        favorited: false
    };
}

async function updateRecipeStar(recipeId) 
{
    await new Promise(resolve => setTimeout(resolve, 300));
    return 
	{
        starred: true,
        newStarCount: 129
    };
}

async function updateRecipeFavorite(recipeId) 
{
    await new Promise(resolve => setTimeout(resolve, 300));
    return 
	{
        favorited: true
    };
} 