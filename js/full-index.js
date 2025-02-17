document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const tabButtons = document.querySelectorAll('.tab-btn');
    let currentTab = 'official';
    let recipes = {
        official: {},
        community: {}
    };
    loadRecipes();
    setupEventListeners();

    function setupEventListeners() 
	{
        tabButtons.forEach(button => 
		{
            button.addEventListener('click', () => 
			{
                const tab = button.dataset.tab;
                switchTab(tab);
            });
        });
        searchInput.addEventListener('input', debounce(filterRecipes, 300));
        sortSelect.addEventListener('change', () => {
            sortRecipes(sortSelect.value);
        });
    }

    async function loadRecipes() 
	{
        try 
		{
            const [officialRecipes, communityRecipes] = await Promise.all([
                fetchOfficialRecipes(),
                fetchCommunityRecipes()
            ]);

            recipes.official = groupRecipesByLetter(officialRecipes);
            recipes.community = groupRecipesByLetter(communityRecipes);

            updateStats(officialRecipes, communityRecipes);
            displayRecipes(currentTab);
        } 
		catch (error) 
		{
            console.error('Error loading recipes:', error);
            showError('Failed to load recipes');
        }
    }

    function groupRecipesByLetter(recipeList) 
	{
        return recipeList.reduce((acc, recipe) => 
		{
            const firstLetter = recipe.title.charAt(0).toUpperCase();
            if (!acc[firstLetter]) 
			{
                acc[firstLetter] = [];
            }
            acc[firstLetter].push(recipe);
            return acc;
        }, {});
    }

    function displayRecipes(tab) 
	{
        const container = document.getElementById(`${tab}-recipes-content`);
        const alphabetContainer = document.getElementById(`${tab}-alphabet`);
        const recipesByLetter = recipes[tab];
        alphabetContainer.innerHTML = Object.keys(recipesByLetter)
            .sort()
            .map(letter => `
                <a href="#${tab}-${letter}" class="letter-link">${letter}</a>
            `).join('');
			
			
			
        container.innerHTML = Object.entries(recipesByLetter)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, recipeList]) => `
                <div id="${tab}-${letter}" class="letter-section">
                    <h2 class="letter-heading">${letter}</h2>
                    <div class="recipe-links">
					
					
                        ${recipeList.map(recipe => `
                            <a href="${recipe.url}" class="recipe-link">
                                <div>
                                    <div class="recipe-link-title">${recipe.title}</div>
                                    <div class="recipe-meta">
                                        ${recipe.author} • ⭐ ${recipe.rating}
                                    </div>
                                </div>
                            </a>
							
							
                        `).join('')}
                    </div>
                </div>
            `).join('');
    }

    function switchTab(tab) 
	{
        tabButtons.forEach(btn => 
		{
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
		
		document.querySelectorAll('.recipe-list').forEach(list => 
		{
            list.classList.toggle('active', list.id === `${tab}-recipes`);
        });
        currentTab = tab;
        displayRecipes(tab);
    }
	
	
	

    function filterRecipes(event) 
	{
        const searchTerm = event.target.value.toLowerCase();
    }

    function sortRecipes(sortMethod) {}

    function updateStats(officialRecipes, communityRecipes) 
	{
		document.getElementById('total-recipes').textContent = (officialRecipes.length + communityRecipes.length).toLocaleString();
		document.getElementById('official-count').textContent = officialRecipes.length.toLocaleString();
		document.getElementById('community-count').textContent = communityRecipes.length.toLocaleString();
    }

    function showError(message) {}


    function debounce(func, wait) 
	{
        let timeout;
        return function executedFunction(...args) 
		{
            const later = () => 
			{
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});

// Mock API
async function fetchOfficialRecipes() 
{
    return 
	[
        {
            title: 'Classic Spaghetti Carbonara',
            url: '/recipe/classic-carbonara',
            author: 'Recspicy Team',
            rating: 4.9
        },
		        {
            title: 'Clanara',
            url: '/recipe/classic-',
            author: 'Recspicy Team',
            rating: 4.0
        },
		        {
            title: 'Classic Spaghetti ',
            url: '/recipe/-carbonara',
            author: 'Recspicy Team',
            rating: 4.3
        },
		        {
            title: ' Spaghetti Carbonara',
            url: '/recipe/classiccarbonara',
            author: 'Recspicy Team',
            rating: 4.4
        },
		        {
            title: 'Classic  Carbonara',
            url: '/recipe/claonara',
            author: 'Recspicy Team',
            rating: 4.5
        },
    ];
}

async function fetchCommunityRecipes() 
{
    return 
	[
        {
            title: 'Homemade Pizza',
            url: '/recipe/homemade-pizza',
            author: 'John Doe',
            rating: 4.7
        },
    ];
} 