document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    initializeHomeFilters();
});

async function loadDashboardStats() {
    try {
        const [userCountRes, recipeCountRes] = await Promise.all([
            fetch('/api/users/count/total'),
            fetch('/api/recipes/count/total')
        ]);

        if (userCountRes.ok) {
            const data = await userCountRes.json();
            const el = document.getElementById('stat-users');
            if (el) el.textContent = data.count ?? '-';
        }

        if (recipeCountRes.ok) {
            const data = await recipeCountRes.json();
            const el = document.getElementById('stat-recipes');
            if (el) el.textContent = data.count ?? '-';
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function initializeHomeFilters() {
    const searchInput = document.getElementById('recipe-search');
    const searchBtn = document.getElementById('search-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sourceBtns = document.querySelectorAll('.source-btn');

    let currentFilter = 'all';
    let currentSource = 'all';
    let currentSearch = '';

    if (searchInput && searchBtn) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = searchInput.value.trim();
                redirectToRecipes(currentFilter, currentSource, currentSearch);
            }, 300);
        });

        searchBtn.addEventListener('click', () => {
            currentSearch = searchInput.value.trim();
            redirectToRecipes(currentFilter, currentSource, currentSearch);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentSearch = searchInput.value.trim();
                redirectToRecipes(currentFilter, currentSource, currentSearch);
            }
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            redirectToRecipes(currentFilter, currentSource, currentSearch);
        });
    });

    sourceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sourceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSource = btn.dataset.source;
            redirectToRecipes(currentFilter, currentSource, currentSearch);
        });
    });
}

function redirectToRecipes(filter, source, search) {
    const url = new URL('recipes-list.html', window.location.origin + window.location.pathname);
    if (filter && filter !== 'all') url.searchParams.set('filter', filter);
    if (source && source !== 'all') url.searchParams.set('source', source);
    if (search) url.searchParams.set('search', search);
    window.location.href = url.toString();
}
