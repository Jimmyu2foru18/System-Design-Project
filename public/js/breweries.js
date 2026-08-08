document.addEventListener('DOMContentLoaded', () => {
    let allBreweries = [];
    let displayedBreweries = [];
    let currentFilter = 'all';
    let currentSearch = '';
    const breweriesPerPage = 12;
    let currentPage = 1;
    let isLoading = false;

    const breweriesContainer = document.getElementById('breweries-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const resultsTitle = document.getElementById('results-title');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');
    const filterBtns = document.querySelectorAll('.filter-btn');

    async function loadBreweries() {
        if (isLoading) return;
        isLoading = true;
        currentPage = 1;

        breweriesContainer.innerHTML = '<div class="loading-spinner"></div>';
        noResults.style.display = 'none';
        loadMoreBtn.style.display = 'none';

        try {
            let breweries = [];

            if (currentSearch) {
                breweries = await window.breweryApi.searchBreweries(currentSearch);
            } else if (currentFilter === 'all') {
                breweries = await window.breweryApi.getBreweries({ page: 1, per_page: 50 });
            } else {
                breweries = await window.breweryApi.getBreweries({ by_type: currentFilter, page: 1, per_page: 50 });
            }

            allBreweries = breweries;
            applyFilters();
        } catch (error) {
            console.error('Error loading breweries:', error);
            breweriesContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load breweries. Please try again later.</p>
                </div>
            `;
        } finally {
            isLoading = false;
        }
    }

    function applyFilters() {
        let filtered = [...allBreweries];

        if (currentSearch) {
            const query = currentSearch.toLowerCase();
            filtered = filtered.filter(brewery =>
                brewery.name?.toLowerCase().includes(query) ||
                brewery.city?.toLowerCase().includes(query) ||
                brewery.country?.toLowerCase().includes(query) ||
                brewery.state?.toLowerCase().includes(query)
            );
        }

        if (currentFilter !== 'all') {
            filtered = filtered.filter(brewery => brewery.brewery_type === currentFilter);
        }

        displayedBreweries = filtered;
        currentPage = 1;
        displayBreweries();
    }

    function displayBreweries() {
        const startIndex = (currentPage - 1) * breweriesPerPage;
        const endIndex = currentPage * breweriesPerPage;
        const breweriesToShow = displayedBreweries.slice(startIndex, endIndex);

        resultsTitle.textContent = currentFilter === 'all' ? 'All Breweries' : `${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)} Breweries`;
        resultsCount.textContent = `${displayedBreweries.length} brewery${displayedBreweries.length !== 1 ? 's' : ''}`;

        if (displayedBreweries.length === 0) {
            breweriesContainer.innerHTML = '';
            noResults.style.display = 'block';
            loadMoreBtn.style.display = 'none';
            return;
        }

        noResults.style.display = 'none';
        breweriesContainer.innerHTML = breweriesToShow.map(brewery => createBreweryCard(brewery)).join('');
        loadMoreBtn.style.display = endIndex >= displayedBreweries.length ? 'none' : 'block';
    }

    function createBreweryCard(brewery) {
        const address = [brewery.address_1, brewery.address_2, brewery.city, brewery.state, brewery.country].filter(Boolean).join(', ') || 'Address not available';

        return `
            <div class="brewery-card">
                <div class="brewery-card-header">
                    <h3 class="brewery-name">${brewery.name || 'Unnamed Brewery'}</h3>
                    <span class="brewery-type">${brewery.brewery_type || 'Unknown'}</span>
                </div>
                <div class="brewery-card-body">
                    <div class="brewery-info">
                        <div class="brewery-info-item">
                            <i>📍</i>
                            <span>${address}</span>
                        </div>
                        ${brewery.phone ? `
                        <div class="brewery-info-item">
                            <i>📞</i>
                            <span>${brewery.phone}</span>
                        </div>
                        ` : ''}
                        ${brewery.website_url ? `
                        <div class="brewery-info-item">
                            <i>🌐</i>
                            <a href="${brewery.website_url}" target="_blank" rel="noopener">Website</a>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="brewery-card-footer">
                    <span class="brewery-country">${brewery.country || 'Unknown'}</span>
                    ${brewery.postal_code ? `<span class="brewery-country">${brewery.postal_code}</span>` : ''}
                </div>
            </div>
        `;
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            currentPage = 1;
            loadBreweries();
        });
    });

    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = this.value.trim();
            currentPage = 1;
            loadBreweries();
        }, 300);
    });

    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadBreweries();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            loadBreweries();
        }
    });

    loadMoreBtn.addEventListener('click', function() {
        currentPage++;
        displayBreweries();
    });

    loadBreweries();
});
