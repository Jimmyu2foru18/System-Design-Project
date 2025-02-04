// Initialize auth and navigation
document.addEventListener('DOMContentLoaded', function() {
    // Load navigation into nav-container
    const navContainer = document.getElementById('nav-container');
    if (navContainer) {
        navContainer.innerHTML = `
            <!-- Title Bar -->
            <div class="bg-blue-600 text-white">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center h-12">
                        <div class="flex items-center space-x-4">
                            <a href="index.html" class="font-bold text-xl">The Recspicy Index</a>
                        </div>
                        <div class="flex items-center space-x-4">
                            <a href="signin.html" class="hover:text-blue-200">Sign In</a>
                            <span>|</span>
                            <a href="signup.html" class="hover:text-blue-200">Sign Up</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Navigation -->
            <nav class="bg-white shadow-lg">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center py-4">
                        <div class="hidden md:flex space-x-8">
                            <a href="index.html" class="text-gray-700 hover:text-blue-600">Home</a>
                            <div class="relative group">
                                <button class="text-gray-700 hover:text-blue-600">Browse</button>
                                <div class="absolute left-0 top-full min-w-max bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:flex flex-col transition-opacity duration-200 z-50">
                                    <a href="by-meal.html" class="block px-4 py-2 hover:bg-gray-100">By Meal</a>
                                    <a href="dietary.html" class="block px-4 py-2 hover:bg-gray-100">Dietary Restrictions</a>
                                </div>
                            </div>
                            <a href="top10.html" class="text-gray-700 hover:text-blue-600">Top 10's</a>
                            <a href="random.html" class="text-gray-700 hover:text-blue-600">Random Recipe</a>
                            <a href="full-index.html" class="text-gray-700 hover:text-blue-600">Full Index</a>
                            <a href="meal-planner.html" class="text-gray-700 hover:text-blue-600">Meal Planner</a>
                        </div>
                        
                        <!-- Account Menu -->
                        <div class="relative group">
                            <button class="text-gray-700 hover:text-blue-600">Account</button>
                            <div class="absolute left-0 top-full min-w-max bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:flex flex-col transition-opacity duration-200 z-50">
                                <a href="profile.html" class="block px-4 py-2 hover:bg-gray-100">Profile</a>
                                <a href="recipe-create.html" class="block px-4 py-2 hover:bg-gray-100">Create Recipe</a>
                                <a href="#" class="block px-4 py-2 hover:bg-gray-100" data-action="sign-out">Sign Out</a>
                            </div>
                        </div>

                        <!-- Mobile Menu Button -->
                        <button class="md:hidden" id="mobile-menu-button">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Mobile Menu -->
                <div class="md:hidden hidden" id="mobile-menu">
                    <div class="px-2 pt-2 pb-3 space-y-1">
                        <a href="index.html" class="block px-3 py-2 hover:bg-gray-100">Home</a>
                        <a href="by-meal.html" class="block px-3 py-2 hover:bg-gray-100">Browse</a>
                        <a href="top10.html" class="block px-3 py-2 hover:bg-gray-100">Top 10's</a>
                        <a href="random.html" class="block px-3 py-2 hover:bg-gray-100">Random Recipe</a>
                        <a href="full-index.html" class="block px-3 py-2 hover:bg-gray-100">Full Index</a>
                        <a href="meal-planner.html" class="block px-3 py-2 hover:bg-gray-100">Meal Planner</a>
                        <a href="profile.html" class="block px-3 py-2 hover:bg-gray-100">Account</a>
                    </div>
                </div>
            </nav>
        `;

        // Mobile menu toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }

    // Load footer into footer-container
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        footerContainer.innerHTML = `
            <footer class="bg-gray-100">
                <div class="container mx-auto px-4 py-8">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 class="font-bold mb-4">About Us</h3>
                            <ul class="space-y-2">
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
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    // Load auth state
    loadAuthState();

    // Add event listeners for auth forms
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    if (signinForm) signinForm.addEventListener('submit', handleSignIn);
    if (signupForm) signupForm.addEventListener('submit', handleSignUp);

    // Add event listeners for auth buttons
    const signOutBtn = document.querySelector('[data-action="sign-out"]');
    if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);
});
