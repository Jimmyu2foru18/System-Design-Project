/**
 * @fileoverview Navigation component that:
 * - Creates responsive navigation bar
 * - Handles user authentication state
 * - Manages search functionality
 * - Provides dropdown menus
 * - Implements mobile responsiveness
 * 
 * @authors James McGuigan, Steven Foster
 */
document.addEventListener("DOMContentLoaded", function () {
    // navigation bar for our consistent base pages
    const navContainer = document.getElementById("nav-container");
    if (navContainer) {
        navContainer.innerHTML = `
            <!-- Title Bar -->
            <div class="bg-blue-600 text-xl text-white">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center h-12">
                        <div class="flex items-center space-x-4">
                            <a href="respicy-index.html" class="font-bold text-xl">The Recspicy Index</a>
                        </div>
                        <!-- Account Menu -->
                        ${getAccountMenu(window.location.pathname.split('/').pop())}
                    </div>                  
                </div>
            </div>

            <!-- Main Navigation -->
            <nav class="bg-white shadow-lg">
                <div class="w-full max-w-6xl mx-auto block p-3 rounded-lg border shadow-sm">
                    <div class="flex justify-between items-center py-4">
                        <div class="hidden md:flex space-x-8">
                            <a href="respicy-index.html" class="text-xl hover:text-blue-600">Home</a>
                            <div class="relative group">
                                <button class="text-xl hover:text-blue-600">Browse</button>
                                <div class="absolute left-0 top-full min-w-max bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:flex flex-col transition-opacity duration-200 z-50">
                                    <a href="by-meal.html" class="block px-4 py-2 hover:bg-gray-100">By Meal</a>
                                    <a href="dietary.html" class="block px-4 py-2 hover:bg-gray-100">Dietary Restrictions</a>
                                </div>
                            </div>
                            <a href="top-recipes.html" class="text-xl hover:text-blue-600">Top 10's</a>
                            <a href="random.html" class="text-xl hover:text-blue-600">Random Recipe</a>
                            <a href="index.html" class="text-xl hover:text-blue-600">Full Index</a>
                            <a href="meal-planner.html" class="text-xl hover:text-blue-600">Meal Planner</a>
                            <a href="search.html" class="text-xl hover:text-blue-600">Search</a>
                            <form action="search.html" method="GET" class="flex items-center" id="nav-search-form">
                                <div class="relative">
                                    <input type="search" 
                                           name="q" 
                                           id="nav-search-input"
                                           placeholder="Search recipes..." 
                                           class="w-48 py-1 px-4 pr-10 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                    <button type="submit" class="absolute right-0 top-0 mt-1 mr-3">
                                        <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>                      
                    </div>
                </div>
            </nav>
        `;

        // sign-out
        const signOutBtn = document.getElementById("sign-out");
        if (signOutBtn) {
            signOutBtn.addEventListener("click", handleSignOut);
        }
    }

	// footer to be able to have placement on landing as well
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
        footerContainer.innerHTML = `
            <footer class="bg-gray-100">
                <div class="container mx-auto px-4 py-8">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 class="font-bold mb-4">About Us</h3>
                            <ul class="space-y-2">
                                <li><a href="landing.html" class="hover:text-blue-600">Landing Page</a></li>
                                <li><a href="about.html" class="hover:text-blue-600">About</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="font-bold mb-4">Help</h3>
                            <ul class="space-y-2">
                                <li><a href="faq.html" class="hover:text-blue-600">FAQ</a></li>
                                <li><a href="support.html" class="hover:text-blue-600">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="font-bold mb-4">Contact</h3>
                            <ul class="space-y-2">
                                <li><a href="contact.html" class="hover:text-blue-600">Contact Us</a></li>
                                <li><a href="feedback.html" class="hover:text-blue-600">Feedback</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="font-bold mb-4">Legal</h3>
                            <ul class="space-y-2">
                                <li><a href="copyright.html" class="hover:text-blue-600">Copyright</a></li>
                                <li><a href="terms-privacy.html" class="hover:text-blue-600">Terms & Privacy</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
});

// Sign-out
function handleSignOut() {
    // Clear any session data or tokens (will be implemented with backend)
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    
    // Redirect to landing page
    window.location.href = 'landing.html';
}

// Update the account menu section
function getAccountMenu(currentPage) {
    const isProfilePage = currentPage === 'profile';
    
    return `
    <div class="relative group">
        <button class="text-black hover:text-gray-800"> <span class="text-shadow">Account</span></button>
        <div class="absolute right-0 top-full min-w-max bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:flex flex-col transition-opacity duration-200 z-50">
            ${!isProfilePage ? `<a href="profile.html" class="block px-4 py-2 text-black rounded-lg hover:bg-gray-300">Profile</a>` : ''}
            <a href="#" onclick="handleSignOut(); return false;" class="block px-4 py-2 text-black rounded-lg hover:bg-gray-300">Sign Out</a>
        </div>
    </div>
    `;
}

function createNavigation() {
    const nav = document.getElementById('nav-container');
    nav.innerHTML = `
        // ... other navigation items ...
        <a href="random.html" class="text-gray-700 hover:text-blue-600">
            Random Recipe
        </a>
        // ... other navigation items ...
    `;
}

// Add to navigation.js
function setupSearchBar() {
    const searchInput = document.querySelector('.nav-search-input');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            if (e.target.value.trim()) {
                const results = await RecipeService.searchRecipes({
                    search: e.target.value,
                    limit: 5
                });
                showSearchResults(results);
            } else {
                hideSearchResults();
            }
        }, 300);
    });
}
