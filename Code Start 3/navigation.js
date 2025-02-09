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
                        <div class="relative group">
                            <button class="text-black hover:text-gray-800"> <span class="text-shadow">Account</span></button>
                            <div class="absolute left-0 top-full min-w-max bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:flex flex-col transition-opacity duration-200 z-50">
                                <a href="profile.html" class="block px-4 py-2 text-black rounded-lg hover:bg-gray-300">Profile</a>
                                <a href="edit-profile.html" class="block px-4 py-2 text-black rounded-lg hover:bg-gray-300">Edit Profile</a>
                                <a href="recipe-create.html" class="block px-4 py-2 text-black rounded-lg hover:bg-gray-300">Create Recipe</a>
                                <a href="#" id="sign-out" class="block px-4 py-2 text-black rounded-lg hover:bg-gray-300">Sign Out</a>
                            </div>
                        </div>
                    </div>                  
                </div>
            </div>

            <!-- Main Navigation -->
            <nav class="bg-white shadow-lg">
                <div class="w-full max-w-5xl mx-auto block p-3 rounded-lg border shadow-sm">
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
                            <a href="top10.html" class="text-xl hover:text-blue-600">Top 10's</a>
                            <a href="random.html" class="text-xl hover:text-blue-600">Random Recipe</a>
                            <a href="full-index.html" class="text-xl hover:text-blue-600">Full Index</a>
                            <a href="meal-planner.html" class="text-xl hover:text-blue-600">Meal Planner</a>
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
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
});

// Sign-out
function handleSignOut(event) {
    event.preventDefault();
    
    fetch("/api/signout", { method: "POST" })
        .then(response => {
            if (response.ok) {
                window.location.href = "landing.html";
            } else {
                console.error("Sign out failed.");
            }
        })
        .catch(error => console.error("Error signing out:", error));
}
