const placeholderUtils = {
    createRecipeCard() {
        const card = document.createElement("div");
        card.className = "recipe-card w-72 bg-white rounded-lg shadow-md overflow-hidden";

        card.innerHTML = `
            <div class="relative pb-48">
                <img src="https://via.placeholder.com/300x200" alt="Recipe" class="absolute inset-0 w-full h-full object-cover">
            </div>
            <div class="p-4">
                <h3 class="text-lg font-bold">Recipe</h3>
                <p class="text-gray-600 text-sm mb-2">Quick and easy to prepare...</p>
                <div class="flex justify-between items-center">
                    <div class="flex space-x-1 text-xs">
                        <span class="bg-gray-100 px-2 py-1 rounded">30 min</span>
                        <span class="bg-gray-100 px-2 py-1 rounded">Easy</span>
                    </div>
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

    populateCards(containerId, count) {
        const container = document.getElementById(containerId);
        if (container) {
            for (let i = 0; i < count; i++) {
                container.appendChild(this.createRecipeCard());
            }
        }
    }
};

// Load placeholders
document.addEventListener("DOMContentLoaded", () => {
    placeholderUtils.populateCards("top-5-container", 5);
    placeholderUtils.populateCards("scroll-container", 12);
});
