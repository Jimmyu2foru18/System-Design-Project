/**
 * @fileoverview Admin functionality that manages:
 * - User account administration
 * - Content moderation workflows
 * - Support ticket handling
 * - Analytics data processing
 * - Site configuration updates
 * - Bulk operations handling
 * - Admin notifications
 * 
 * @authors James McGuigan, Steven Foster
 */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load initial dashboard data
        const stats = await AdminService.getDashboardStats();
        updateDashboardStats(stats);

        // Load pending recipes
        const pendingRecipes = await AdminService.getPendingRecipes();
        updatePendingRecipes(pendingRecipes);

        // Setup WebSocket listeners
        WebSocketService.on('new_recipe_submitted', handleNewRecipe);
        WebSocketService.on('user_registered', handleNewUser);
        WebSocketService.on('email_change_requested', handleEmailChangeRequest);
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
    }
});

function updateDashboardStats(stats) {
    document.getElementById('total-users').textContent = stats.totalUsers;
    document.getElementById('total-recipes').textContent = stats.totalRecipes;
    document.getElementById('pending-recipes').textContent = stats.pendingRecipes;
    document.getElementById('total-ratings').textContent = stats.totalRatings;
}

function updatePendingRecipes(recipes) {
    const container = document.getElementById('pending-recipes-list');
    container.innerHTML = recipes.map(recipe => `
        <tr>
            <td class="px-6 py-4">${recipe.title}</td>
            <td class="px-6 py-4">${recipe.authorUsername}</td>
            <td class="px-6 py-4">${recipe.category}</td>
            <td class="px-6 py-4">${new Date(recipe.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4">
                <button onclick="previewRecipe('${recipe._id}')" class="text-blue-500 hover:text-blue-700 mr-3">Preview</button>
                <button onclick="approveRecipe('${recipe._id}')" class="text-green-500 hover:text-green-700 mr-3">Approve</button>
                <button onclick="rejectRecipe('${recipe._id}')" class="text-red-500 hover:text-red-700">Reject</button>
            </td>
        </tr>
    `).join('');
}

// WebSocket handlers
function handleNewRecipe(recipe) {
    // Update pending recipes count
    const pendingCount = document.getElementById('pending-recipes');
    pendingCount.textContent = parseInt(pendingCount.textContent) + 1;
    
    // Add new recipe to list
    const container = document.getElementById('pending-recipes-list');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td class="px-6 py-4">${recipe.title}</td>
        <td class="px-6 py-4">${recipe.authorUsername}</td>
        <td class="px-6 py-4">${recipe.category}</td>
        <td class="px-6 py-4">${new Date(recipe.createdAt).toLocaleDateString()}</td>
        <td class="px-6 py-4">
            <button onclick="previewRecipe('${recipe._id}')" class="text-blue-500 hover:text-blue-700 mr-3">Preview</button>
            <button onclick="approveRecipe('${recipe._id}')" class="text-green-500 hover:text-green-700 mr-3">Approve</button>
            <button onclick="rejectRecipe('${recipe._id}')" class="text-red-500 hover:text-red-700">Reject</button>
        </td>
    `;
    container.insertBefore(newRow, container.firstChild);
} 