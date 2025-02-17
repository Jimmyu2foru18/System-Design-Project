$(document).ready(function() 
{
    $('#search-form').submit(function(e) 
	{
        e.preventDefault();
        
        $.ajax(
		{
            url: 'api/recipes.php',
            type: 'GET',
            data: {
                q: $('#search-input').val(),
                cuisine: $('#cuisine-filter').val()
            },
            success: function(data) 
			{
                displayResults(data);
            },
            error: function(xhr) 
			{
                showError(xhr.responseJSON?.error || 'Search failed');
            }
        });
    });
});

function displayResults(recipes) 
{
    const $grid = $('#results-grid').empty();
    recipes.forEach(recipe => 
	{
        $grid.append(`
            <div class="recipe-card">
                <h3>${$.escapeHtml(recipe.title)}</h3>
                <p>${$.escapeHtml(recipe.description)}</p>
            </div>
        `);
    });
}

document.addEventListener('DOMContentLoaded', () => 
{
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsGrid = document.getElementById('results-grid');
    const resultsCount = document.getElementById('results-count');
    const sortSelect = document.getElementById('sort-select');
    const filters = 
	{
        cuisine: document.getElementById('cuisine-filter'),
        meal: document.getElementById('meal-filter'),
        diet: document.getElementById('diet-filter'),
        time: document.getElementById('time-filter')
    };
	
	
	
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('q')) 
	{
        searchInput.value = urlParams.get('q');
        performSearch();
    }

    searchForm.addEventListener('submit', (e) => 
	{
        e.preventDefault();
        performSearch();
    });

    sortSelect.addEventListener('change', () => 
	{
        sortResults();
    });

    Object.values(filters).forEach(filter => {
        filter.addEventListener('change', () => 
		{
            performSearch();
        });
    });

    async function performSearch() 
	{
        const query = searchInput.value.trim();
        if (!query) return;

        try 
		{
            const recipes = await fetchRecipes(query, 
			{
                mealType: document.getElementById('meal-type').value,
                allergens: getSelectedAllergens(),
                // ... add more/other filters
            });
            displayResults(recipes);
        } 
		catch (error) 
		{
            console.error('Search error:', error);
            showError('Failed to perform search. Please try again.');
        }
    }

    function displayResults(results) 
	{
        resultsCount.textContent = `${results.length} results found`;
        
        if (results.length === 0) 
		{
            resultsGrid.innerHTML = `
                <div class="no-results">
                    <h3>No recipes found</h3>
                    <p>Try adjusting your search terms or filters</p>
                </div>
            `;
            return;
        }

        resultsGrid.innerHTML = results.map(recipe => `
            <div class="recipe-card">
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span>${recipe.cookTime} mins</span>
                        <span>★ ${recipe.rating}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function sortResults() 
	{
        const results = Array.from(resultsGrid.children);
        const sortBy = sortSelect.value;

        results.sort((a, b) => 
		{
            switch (sortBy) 
			{
                case 'rating':
                    return getRating(b) - getRating(a);
                case 'time':
                    return getCookTime(a) - getCookTime(b);
                default:
                    return 0;
            }
        });

        resultsGrid.innerHTML = '';
        results.forEach(result => resultsGrid.appendChild(result));
    }

    function getRating(element) 
	{
        return parseFloat(element.querySelector('.recipe-meta span:last-child').textContent.replace('★ ', ''));
    }

    function getCookTime(element) 
	{
        return parseInt(element.querySelector('.recipe-meta span:first-child').textContent);
    }

    function showError(message) 
	{
        resultsGrid.innerHTML = `
            <div class="no-results">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    function getSelectedAllergens() 
	{
        return Array.from(document.querySelectorAll('input[name="allergens"]:checked'))
            .map(checkbox => checkbox.value);
    }

    async function fetchRecipes(query, filters) {
        await new Promise(resolve => setTimeout(resolve, 500));

        let recipes = mockRecipes.filter(recipe => 
		{
            if (!recipe.title.toLowerCase().includes(query.toLowerCase())) 
			{
                return false;
            }

            if (filters.mealType && recipe.mealType !== filters.mealType) 
			{
                return false;
            }

            if (filters.allergens.length > 0) 
			{
                return filters.allergens.every(allergen => !recipe.allergens.includes(allergen));
            }

            return true;
        });

        return recipes;
    }

    const mockRecipes = [
        {
            title: 'Classic Pancakes',
            mealType: 'breakfast',
            allergens: ['dairy', 'eggs', 'gluten'],
        },
        {
            title: 'Vegan Curry',
            mealType: 'dinner',
            allergens: ['soy'],
        },
    ];

    document.querySelectorAll('input[name="allergens"]').forEach(checkbox => 
	{
        checkbox.addEventListener('change', () => 
		{
            const query = document.getElementById('search-input').value;
            performSearch();
        });
    });
}); 