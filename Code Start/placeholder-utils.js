const placeholderUtils = {
    createRecipeCard() {
        const card = document.createElement("div");
        card.className = "recipe-card w-72";

        card.innerHTML = `
            <!-- Recipe Card -->
            <div class="relative pb-48">
                <!-- Recipe Image -->
                <img src="https://via.placeholder.com/300x200" alt="Recipe" 
                     class="absolute inset-0 w-full h-full object-cover">
            </div>

            <!-- Recipe Details -->
            <div class="p-12">
                <!-- Title -->
                <h3 class="text-lg font-bold mb-2"> Recipe</h3>
                
                <!-- Description -->
                <p class="text-gray-600 text-sm mb-4">Quick and easy to prepare...</p>

                <!-- Tags & Rating + Favorite -->
                <div class="flex justify-between items-center">
                    <!-- Time & Difficulty Tags -->
                    <div class="flex space-x-1">
                        <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">30 min</span>
                        <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Easy</span>
                    </div>
                    
                    <!-- Rating & Favorite Button d= draws a heart icon -->
                    <div class="flex items-center space-x-1">
                        <span class="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">4.96 ⭐</span>
                        <button class="text-blue-600 hover:text-blue-800">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        return card;
    },

    populateCards() {
        const top5Container = document.getElementById("top-5-container");
        if (top5Container) {
            for (let i = 0; i < 5; i++) {
                top5Container.appendChild(this.createRecipeCard());
            }
        }

        const scrollContainer = document.getElementById("scroll-container");
        if (scrollContainer) {
            for (let i = 0; i < 12; i++) {
                scrollContainer.appendChild(this.createRecipeCard());
            }
        }
    }
};

// puts cards when DOM loads
document.addEventListener("DOMContentLoaded", () => {
    placeholderUtils.populateCards();
});
