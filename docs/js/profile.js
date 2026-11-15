document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('userId') || !localStorage.getItem('authToken')) {
        window.location.href = 'signin.html';
        return;
    }

    if (typeof initNavigation === 'function') {
        initNavigation();
    }

    loadUserProfile();
    initializeTabs();
    setupProfileEditButton();
    setupLogoutButton();
    loadInitialTab();
});

function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (typeof handleSignOut === 'function') {
                handleSignOut();
            } else {
                localStorage.removeItem('userId');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userProfile');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                window.location.href = 'signin.html';
            }
        });
    }
}

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    if (!tabs || tabs.length === 0) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            if (tabName) {
                activateTab(tab, tabName);
            }
        });
    });
}

function loadTabContent(tabName) {
    switch (tabName) {
        case 'favorites':
            loadFavorites();
            break;
        case 'my-recipes':
            loadUserRecipes();
            break;
        case 'meal-plans':
            loadMealPlans();
            break;
    }
}

function activateTab(selectedTab, tabName) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    selectedTab.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
        loadTabContent(tabName);
    }
}

function loadInitialTab() {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const tabName = activeTab.dataset.tab;
        loadTabContent(tabName);
    } else {
        loadUserRecipes();
    }
}

function displayUserProfile(userData) {
    document.getElementById('profile-name').textContent = userData.name || 'User';
    document.getElementById('profile-bio').textContent = userData.bio || 'No bio provided. Click edit to add one.';

    const monogramEl = document.getElementById('avatar-monogram');
    const avatarImg = document.getElementById('profile-avatar-img');

    if (monogramEl) {
        monogramEl.textContent = getMonogram(userData.name || 'U');
    }

    const userId = localStorage.getItem('userId');
    const avatar = userData.avatar;
    const hasAvatar = avatar && (
        (typeof avatar === 'object' && avatar.data) ||
        (typeof avatar === 'string' && avatar.trim() !== '')
    );

    if (hasAvatar && avatarImg) {
        avatarImg.src = `/api/users/${userId}/avatar?t=${Date.now()}`;
        avatarImg.style.display = 'block';
        avatarImg.onerror = function () {
            this.style.display = 'none';
            if (monogramEl) monogramEl.style.display = 'flex';
        };
        if (monogramEl) monogramEl.style.display = 'none';
    } else {
        if (avatarImg) avatarImg.style.display = 'none';
        if (monogramEl) monogramEl.style.display = 'flex';
    }
}

function getMonogram(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
}

async function loadUserProfile() {
    try {
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');

        if (!userId || !authToken) {
            window.location.href = 'signin.html';
            return;
        }

        showLoading('Loading profile...');

        const response = await fetch(`/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        let userData;
        if (response.ok) {
            userData = await response.json();
            localStorage.setItem('userProfile', JSON.stringify(userData));
        } else {
            const cachedProfile = localStorage.getItem('userProfile');
            if (cachedProfile) {
                userData = JSON.parse(cachedProfile);
            } else {
                userData = {
                    _id: userId,
                    name: localStorage.getItem('userName') || 'User',
                    email: localStorage.getItem('userEmail') || '',
                    bio: 'Click edit to update your profile.',
                    avatar: ''
                };
            }
        }

        displayUserProfile(userData);
        hideLoading();

    } catch (error) {
        console.error('Error loading profile:', error);
        hideLoading();
        showError('Failed to load profile data');

        const basicUserData = {
            name: localStorage.getItem('userName') || 'User',
            bio: 'Click edit to update your profile.'
        };
        displayUserProfile(basicUserData);
    }
}

function setupProfileEditButton() {
    const editButton = document.getElementById('edit-profile-btn');
    if (editButton) {
        editButton.addEventListener('click', openEditProfileModal);
    }
}

function openEditProfileModal() {
    const userId = localStorage.getItem('userId');

    fetch(`/api/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
        .then(response => response.ok ? response.json() : null)
        .then(userData => {
            if (!userData) {
                userData = {
                    name: document.getElementById('profile-name').textContent,
                    bio: document.getElementById('profile-bio').textContent,
                    avatar: document.querySelector('.profile-avatar').src
                };
            }

            document.getElementById('edit-name').value = userData.name || '';
            document.getElementById('edit-bio').value = userData.bio || '';

            const preview = document.getElementById('profile-image-preview');
            preview.style.display = 'none';
            preview.src = '';

            document.getElementById('edit-profile-modal').classList.add('show');
        })
        .catch(error => {
            console.error('Error fetching user data for edit:', error);
            showError('Could not load user data for editing');
        });
}

function closeEditProfileModal() {
    document.getElementById('edit-profile-modal').classList.remove('show');
}

function handleProfileImageChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('profile-image-preview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

async function saveProfileChanges(event) {
    event.preventDefault();

    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    const name = document.getElementById('edit-name').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('name', name);
    formData.append('bio', bio);

    const imageInput = document.getElementById('edit-profile-image');
    if (imageInput && imageInput.files.length > 0) {
        formData.append('avatar', imageInput.files[0]);
    }

    try {
        showLoading('Updating profile...');

        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        if (response.ok) {
            const updatedUser = await response.json();
            displayUserProfile(updatedUser);

            localStorage.setItem('userName', name);
            localStorage.setItem('userBio', bio);

            closeEditProfileModal();
            hideLoading();
            showNotification('Profile updated successfully', 'success');
            return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API update failed with status: ${response.status}`);

    } catch (error) {
        console.error('Error updating profile:', error);
        hideLoading();

        displayUserProfile({ name, bio });
        localStorage.setItem('userName', name);
        localStorage.setItem('userBio', bio);

        closeEditProfileModal();
        showNotification('Could not save to server. Changes are only visible temporarily.', 'error');
    }
}

function showLoading(message) {
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-message" id="loading-message"></div>
        `;
        document.body.appendChild(loadingOverlay);
    }

    document.getElementById('loading-message').textContent = message || 'Loading...';
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }, 10);
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function loadUserRecipes() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const recipesContainer = document.getElementById('user-recipes-container');
    recipesContainer.innerHTML = `
        <div class="skeleton-recipe"></div>
        <div class="skeleton-recipe"></div>
        <div class="skeleton-recipe"></div>
    `;

    fetch(`/api/recipes/user/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }
            return response.json();
        })
        .then(recipes => {
            recipesContainer.innerHTML = '';

            if (recipes.length === 0) {
                recipesContainer.innerHTML = `
                    <div class="empty-state">
                        <p>You haven't created any recipes yet.</p>
                        <button class="btn btn-primary" onclick="window.location.href='create-recipe.html'">Create Your First Recipe</button>
                    </div>
                `;
                return;
            }

            recipes.forEach(recipe => {
                const recipeCard = document.createElement('div');
                recipeCard.className = 'recipe-card';

                const imageUrl = recipe.image || '';

                recipeCard.innerHTML = `
                    <div class="recipe-card-image">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(recipe.title)}">` : `<div class="avatar-monogram" style="width:100%;height:100%;font-size:2rem;">${getMonogram(recipe.title || 'R')}</div>`}
                    </div>
                    <div class="recipe-card-content">
                        <h3 class="recipe-card-title">${escapeHtml(recipe.title)}</h3>
                        <div class="recipe-meta">
                            <span>${recipe.difficulty || 'Medium'} • ${recipe.cookingTime || 30} mins</span>
                        </div>
                        <p class="recipe-card-description">${escapeHtml(recipe.description || 'No description provided.')}</p>
                        <div class="recipe-card-actions">
                            <button class="btn btn-outline btn-sm" onclick="window.location.href='recipes.html?id=${escapeHtml(recipe._id)}'">View</button>
                            <button class="btn btn-outline btn-sm" onclick="editRecipe('${escapeHtml(recipe._id)}')">Edit</button>
                            <button class="btn btn-outline btn-sm" onclick="deleteRecipe('${escapeHtml(recipe._id)}')">Delete</button>
                        </div>
                    </div>
                `;

                recipesContainer.appendChild(recipeCard);
            });
        })
        .catch(error => {
            console.error('Error loading recipes:', error);
            recipesContainer.innerHTML = `
                <div class="error-state">
                    <p>Failed to load recipes. Please try again later.</p>
                    <div class="btn-group">
                        <button class="btn btn-outline" onclick="loadUserRecipes()">Retry</button>
                        <button class="btn btn-primary" onclick="window.location.href='create-recipe.html'">Create Your First Recipe</button>
                    </div>
                </div>
            `;
        });
}

function editRecipe(recipeId) {
    window.location.href = `create-recipe.html?edit=${recipeId}`;
}

async function deleteRecipe(recipeId) {
    try {
        const response = await fetch(`/api/recipes/${recipeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            loadUserRecipes();
            showSuccess('Recipe deleted successfully');
        } else {
            showError('Failed to delete recipe');
        }
    } catch (error) {
        console.error('Error deleting recipe:', error);
        showError('Failed to delete recipe');
    }
}

async function loadMealPlans() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const container = document.getElementById('meal-plans-grid');
        container.innerHTML = `
            <div class="skeleton-meal-plan"></div>
            <div class="skeleton-meal-plan"></div>
        `;

        const response = await fetch(`/api/meal-plans/user/${userId}`);
        if (!response.ok) throw new Error('Failed to load meal plans');

        const data = await response.json();
        const mealPlans = data.mealPlans || data || [];
        displayMealPlans(mealPlans);
    } catch (error) {
        console.error('Error loading meal plans:', error);
        const container = document.getElementById('meal-plans-grid');
        container.innerHTML = `
            <div class="error-state">
                <p>Failed to load meal plans. Please try again later.</p>
                <div class="btn-group">
                    <button class="btn btn-outline" onclick="loadMealPlans()">Retry</button>
                    <button class="btn btn-primary" onclick="window.location.href='meal-planner.html'">Create Your First Meal Plan</button>
                </div>
            </div>
        `;
    }
}

function displayMealPlans(mealPlans) {
    const container = document.getElementById('meal-plans-grid');
    if (!mealPlans || mealPlans.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No meal plans found. Create your first one!</p>
                <button class="btn btn-primary" onclick="window.location.href='meal-planner.html'">Create Your First Meal Plan</button>
            </div>
        `;
        return;
    }

    container.innerHTML = mealPlans.map(plan => `
        <div class="meal-plan-card">
            <h3>${escapeHtml(plan.planName)}</h3>
            <p>${escapeHtml(plan.description || 'No description')}</p>
            <div class="meal-plan-days">
                ${Object.keys(plan.days).map(day => `
                    <div class="meal-plan-day">
                        <strong>${day.charAt(0).toUpperCase() + day.slice(1)}:</strong> ${escapeHtml(plan.days[day].meal || 'No meal planned')}
                    </div>
                `).join('')}
            </div>
            <div class="meal-plan-actions">
                <button class="btn btn-outline btn-sm" data-id="${plan._id}" onclick="window.location.href='meal-planner.html?id=${escapeHtml(plan._id)}'">Edit</button>
                <button class="btn btn-outline btn-sm" data-id="${plan._id}" onclick="deleteMealPlan('${escapeHtml(plan._id)}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteMealPlan(mealPlanId) {
    if (confirm('Are you sure you want to delete this meal plan?')) {
        try {
            const response = await fetch(`/api/meal-plans/${mealPlanId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: localStorage.getItem('userId')
                })
            });

            if (!response.ok) {
                throw new Error('Failed to delete meal plan');
            }

            await loadMealPlans();
            showSuccess('Meal plan deleted successfully');
        } catch (error) {
            console.error('Error deleting meal plan:', error);
            showError(error.message || 'Failed to delete meal plan');
        }
    }
}

async function loadFavorites() {
    try {
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        const favoritesContainer = document.getElementById('favorites-container');

        if (!userId || !authToken) {
            window.location.href = 'signin.html';
            return;
        }

        favoritesContainer.innerHTML = `
            <div class="skeleton-recipe"></div>
            <div class="skeleton-recipe"></div>
        `;

        const userResponse = await fetch(`/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        const favorites = userData.favorites || userData.profileData?.favorites || [];

        if (favorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="empty-state">
                    <p>No favorite recipes found.</p>
                    <button class="btn btn-primary" onclick="window.location.href='recipes-list.html'">Browse Recipes</button>
                </div>
            `;
            return;
        }

        const recipePromises = favorites.map(id =>
            fetch(`/api/recipes/${id}`)
                .then(res => res.ok ? res.json() : null)
                .catch(() => null)
        );

        const recipes = (await Promise.all(recipePromises)).filter(Boolean);

        if (recipes.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="empty-state">
                    <p>No favorite recipes found.</p>
                    <button class="btn btn-primary" onclick="window.location.href='recipes-list.html'">Browse Recipes</button>
                </div>
            `;
            return;
        }

        favoritesContainer.innerHTML = '';
        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            const imageUrl = recipe.image || '';
            card.innerHTML = `
                <div class="recipe-card-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(recipe.title)}">` : `<div class="avatar-monogram" style="width:100%;height:100%;font-size:2rem;">${getMonogram(recipe.title || 'R')}</div>`}
                </div>
                <div class="recipe-card-content">
                    <h3 class="recipe-card-title">${escapeHtml(recipe.title)}</h3>
                    <p class="recipe-card-description">${escapeHtml(recipe.description || '')}</p>
                </div>
            `;
            card.addEventListener('click', () => {
                window.location.href = `recipes.html?id=${recipe._id || recipe.idMeal || recipe.id}`;
            });
            favoritesContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading favorites:', error);
        document.getElementById('favorites-container').innerHTML = `
            <div class="error-state">
                <p>Failed to load favorite recipes</p>
                <div class="btn-group">
                    <button class="btn btn-outline" onclick="loadFavorites()">Retry</button>
                    <button class="btn btn-primary" onclick="window.location.href='recipes-list.html'">Browse Recipes</button>
                </div>
            </div>
        `;
    }
}
