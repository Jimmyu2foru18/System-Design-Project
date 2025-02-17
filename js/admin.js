document.addEventListener('DOMContentLoaded', () => {
    const adminToken = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');

    if (!adminToken || userRole !== 'admin') {
        window.location.href = 'signin.html';
        return;
    }
    initializeNavigation();
    initializeModals();
    initializeRealtimeUpdates();
    loadOverviewData();
});

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            loadSectionContent(section);
        });
    });
}

async function loadSectionContent(section) {
    const contentArea = document.querySelector('.admin-content');
    
    try {
        switch(section) {
            case 'overview':
                await loadOverviewData();
                break;
            case 'users':
                await loadUserManagement();
                break;
            case 'feedback':
                await loadFeedbackSection();
                break;
            case 'contact':
                await loadContactMessages();
                break;
            case 'recipes':
                await loadRecipeManagement();
                break;
            case 'database':
                await loadDatabaseManagement();
                break;
        }
    } catch (error) {
        console.error('Error loading section:', error);
        showError('Failed to load section content');
    }
}

async function loadOverviewData() {
    // replace this with API calls, "placeholder"
    const stats = await mockGetOverviewStats();
    updateOverviewStats(stats);
}

function updateOverviewStats(stats) {
    const statCards = document.querySelectorAll('.stat-card');
    const statData = [
        { value: stats.totalUsers, label: 'Total Users' },
        { value: stats.totalRecipes, label: 'Total Recipes' },
        { value: stats.newMessages, label: 'New Messages' },
        { value: stats.pendingReviews, label: 'Pending Reviews' }
    ];

    statCards.forEach((card, index) => {
        card.querySelector('.stat-value').textContent = statData[index].value;
        card.querySelector('.stat-label').textContent = statData[index].label;
    });
}

async function loadUserManagement() {
    const content = `
        <div class="section-header">
            <h2 class="section-title">User Management</h2>
            <div class="filters">
                <select class="filter-select" id="user-status-filter">
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                </select>
            </div>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="users-table-body">
                <!-- User data will be dynamically loaded -->
            </tbody>
        </table>
    `;

    document.querySelector('.admin-content').innerHTML = content;
    await loadUserData();
}

async function loadFeedbackSection() {
    const content = `
        <div class="section-header">
            <h2 class="section-title">User Feedback</h2>
            <div class="filters">
                <select class="filter-select" id="feedback-status-filter">
                    <option value="all">All Feedback</option>
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="feedback-table-body">
                <!-- Feedback data will be dynamically loaded -->
            </tbody>
        </table>
    `;

    document.querySelector('.admin-content').innerHTML = content;
    await loadFeedbackData();
}

async function loadContactMessages() {
    const content = `
        <div class="section-header">
            <h2 class="section-title">Contact Messages</h2>
            <div class="filters">
                <select class="filter-select" id="message-status-filter">
                    <option value="all">All Messages</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                </select>
            </div>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>From</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="messages-table-body">
                <!-- Message data will be dynamically loaded -->
            </tbody>
        </table>
    `;

    document.querySelector('.admin-content').innerHTML = content;
    await loadMessageData();
}

async function loadRecipeManagement() {
    const content = `
        <div class="section-header">
            <h2 class="section-title">Recipe Management</h2>
            <div class="filters">
                <select class="filter-select" id="recipe-status-filter">
                    <option value="all">All Recipes</option>
                    <option value="published">Published</option>
                    <option value="pending">Pending Review</option>
                    <option value="flagged">Flagged</option>
                </select>
            </div>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Recipe Name</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Date Added</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="recipes-table-body">
                <!-- Recipe data will be dynamically loaded -->
            </tbody>
        </table>
    `;

    document.querySelector('.admin-content').innerHTML = content;
    await loadRecipeData();
}

async function loadDatabaseManagement() {
    const content = `
        <div class="section-header">
            <h2 class="section-title">Database Management</h2>
            <div class="database-actions">
                <button class="action-btn" onclick="backupDatabase()">Backup Database</button>
                <button class="action-btn" onclick="optimizeDatabase()">Optimize Database</button>
                <button class="action-btn" onclick="clearCache()">Clear Cache</button>
            </div>
        </div>
        <div class="database-stats">
            <!-- Database statistics will be dynamically loaded -->
        </div>
    `;

    document.querySelector('.admin-content').innerHTML = content;
    await loadDatabaseStats();
}

function initializeModals() {
    const modal = document.getElementById('view-modal');
    const closeBtn = modal.querySelector('.close-modal');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Mock API
async function mockGetOverviewStats() {
    return {
        totalUsers: 1234,
        totalRecipes: 5678,
        newMessages: 42,
        pendingReviews: 89
    };
}

async function loadUserData() {
    const users = await mockGetUsers();
    const tableBody = document.getElementById('users-table-body');
    
    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></td>
            <td>${user.joinedDate}</td>
            <td>
                <button class="action-btn view-btn" onclick="viewUser('${user.id}')">View</button>
                <button class="action-btn edit-btn" onclick="editUser('${user.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function loadFeedbackData() {
    const feedback = await mockGetFeedback();
    const tableBody = document.getElementById('feedback-table-body');
    
    tableBody.innerHTML = feedback.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.username}</td>
            <td>${item.type}</td>
            <td><span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span></td>
            <td>
                <button class="action-btn view-btn" onclick="viewFeedback('${item.id}')">View</button>
                <button class="action-btn edit-btn" onclick="updateFeedbackStatus('${item.id}')">Update</button>
            </td>
        </tr>
    `).join('');
}

async function loadMessageData() {
    const messages = await mockGetMessages();
    const tableBody = document.getElementById('messages-table-body');
    
    tableBody.innerHTML = messages.map(message => `
        <tr>
            <td>${message.date}</td>
            <td>${message.from}</td>
            <td>${message.subject}</td>
            <td><span class="status-badge status-${message.status.toLowerCase()}">${message.status}</span></td>
            <td>
                <button class="action-btn view-btn" onclick="viewMessage('${message.id}')">View</button>
                <button class="action-btn edit-btn" onclick="replyToMessage('${message.id}')">Reply</button>
            </td>
        </tr>
    `).join('');
}

async function loadRecipeData() {
    const recipes = await mockGetRecipes();
    const tableBody = document.getElementById('recipes-table-body');
    
    tableBody.innerHTML = recipes.map(recipe => `
        <tr>
            <td>${recipe.name}</td>
            <td>${recipe.author}</td>
            <td><span class="status-badge status-${recipe.status.toLowerCase()}">${recipe.status}</span></td>
            <td>${recipe.dateAdded}</td>
            <td>
                <button class="action-btn view-btn" onclick="viewRecipe('${recipe.id}')">View</button>
                <button class="action-btn edit-btn" onclick="editRecipe('${recipe.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteRecipe('${recipe.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function loadDatabaseStats() {
    const stats = await mockGetDatabaseStats();
    const statsContainer = document.querySelector('.database-stats');
    
    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.dbSize}</div>
                <div class="stat-label">Database Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.lastBackup}</div>
                <div class="stat-label">Last Backup</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.cacheSize}</div>
                <div class="stat-label">Cache Size</div>
            </div>
        </div>
    `;
}

async function viewUser(userId) {
    const user = await mockGetUserDetails(userId);
    showModal('User Details', `
        <div class="user-details">
            <h3>${user.username}</h3>
            <p>Email: ${user.email}</p>
            <p>Status: ${user.status}</p>
            <p>Joined: ${user.joinedDate}</p>
            <p>Last Active: ${user.lastActive}</p>
        </div>
    `);
}

async function editUser(userId) {
    const user = await mockGetUserDetails(userId);
    showModal('Edit User', `
        <form id="edit-user-form">
            <div class="form-group">
                <label>Status</label>
                <select name="status" class="form-select">
                    <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    <option value="banned" ${user.status === 'banned' ? 'selected' : ''}>Banned</option>
                </select>
            </div>
            <button type="submit" class="action-btn save-btn">Save Changes</button>
        </form>
    `);
}

async function mockGetUsers() {
    return [
        { id: '1', username: 'john_doe', email: 'john@example.com', status: 'Active', joinedDate: '2024-01-15' },
        { id: '2', username: 'jane_smith', email: 'jane@example.com', status: 'Inactive', joinedDate: '2024-02-01' }
    ];
}

async function mockGetFeedback() {
    return [
        { id: '1', date: '2024-03-01', username: 'john_doe', type: 'Bug Report', status: 'New' },
        { id: '2', date: '2024-03-02', username: 'jane_smith', type: 'Feature Request', status: 'In Progress' }
    ];
}

async function mockGetMessages() {
    return [
        { id: '1', date: '2024-03-01', from: 'user@example.com', subject: 'Account Issue', status: 'Unread' },
        { id: '2', date: '2024-03-02', from: 'another@example.com', subject: 'Recipe Question', status: 'Read' }
    ];
}

async function mockGetRecipes() {
    return [
        { id: '1', name: 'Spaghetti', author: 'chef_john', status: 'Published', dateAdded: '2024-02-15' },
        { id: '2', name: 'Chicken', author: 'cooking_pro', status: 'Pending', dateAdded: '2024-03-01' }
    ];
}

async function mockGetDatabaseStats() {
    return {
        dbSize: '2.5 GB',
        lastBackup: '2024-03-01 12:00',
        cacheSize: '256 MB'
    };
}

function showError(message) {
    console.error(message);
}

function initializeRealtimeUpdates() {
    setupDatabaseListeners();
    setInterval(refreshStats, 30000);
}

function setupDatabaseListeners() {
    document.addEventListener('userRegistered', updateUserCount);
    document.addEventListener('recipeCreated', updateRecipeCount);
    document.addEventListener('recipeDeleted', updateRecipeCount);
    document.addEventListener('contactSubmitted', updateMessageCount);
    document.addEventListener('feedbackSubmitted', updateMessageCount);
    document.addEventListener('reviewSubmitted', updateReviewCount);
}

async function refreshStats() {
    try {
        const stats = await fetchCurrentStats();
        updateDashboardStats(stats);
    } catch (error) {
        console.error('Error refreshing stats:', error);
    }
}

async function fetchCurrentStats() {
    // In a real implementation, this would make an API call
    // For now, we'll use localStorage to sim a database
    return {
        userCount: parseInt(localStorage.getItem('totalUsers')) || 0,
        recipeCount: parseInt(localStorage.getItem('totalRecipes')) || 0,
        messageCount: parseInt(localStorage.getItem('totalMessages')) || 0,
        reviewCount: parseInt(localStorage.getItem('pendingReviews')) || 0
    };
}

function updateDashboardStats(stats) {
    const statElements = document.querySelectorAll('.stat-value');
    if (statElements.length >= 4) {
        statElements[0].textContent = stats.userCount.toLocaleString();
        statElements[1].textContent = stats.recipeCount.toLocaleString();
        statElements[2].textContent = stats.messageCount.toLocaleString();
        statElements[3].textContent = stats.reviewCount.toLocaleString();
    }
}

function updateUserCount(event) {
    const currentCount = parseInt(localStorage.getItem('totalUsers')) || 0;
    localStorage.setItem('totalUsers', currentCount + 1);
    refreshStats();
}

function updateRecipeCount(event) {
    const currentCount = parseInt(localStorage.getItem('totalRecipes')) || 0;
    const newCount = event.type === 'recipeCreated' ? currentCount + 1 : currentCount - 1;
    localStorage.setItem('totalRecipes', newCount);
    refreshStats();
}

function updateMessageCount(event) {
    const currentCount = parseInt(localStorage.getItem('totalMessages')) || 0;
    localStorage.setItem('totalMessages', currentCount + 1);
    refreshStats();
}

function updateReviewCount(event) {
    const currentCount = parseInt(localStorage.getItem('pendingReviews')) || 0;
    localStorage.setItem('pendingReviews', currentCount + 1);
    refreshStats();
}

export function dispatchDatabaseEvent(eventType, data) {
    const event = new CustomEvent(eventType, { detail: data });
    document.dispatchEvent(event);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeNavigation,
        loadSectionContent,
        loadOverviewData
    };
} 