document.addEventListener('DOMContentLoaded', () => {
    let allReports = [];
    let displayedReports = [];
    let currentFilter = 'all';
    let currentSearch = '';
    const reportsPerPage = 12;
    let currentPage = 1;
    let isLoading = false;

    const reportsContainer = document.getElementById('reports-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const resultsTitle = document.getElementById('results-title');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');
    const filterBtns = document.querySelectorAll('.filter-btn');

    async function loadReports() {
        if (isLoading) return;
        isLoading = true;
        currentPage = 1;

        reportsContainer.innerHTML = '<div class="loading-spinner"></div>';
        noResults.style.display = 'none';
        loadMoreBtn.style.display = 'none';

        try {
            const filters = {};
            if (currentFilter !== 'all') {
                filters.category = currentFilter;
            }
            if (currentSearch) {
                filters.search = currentSearch;
            }

            const reports = await window.reportApi.getReports(filters);
            allReports = Array.isArray(reports) ? reports : [];
            applyFilters();
        } catch (error) {
            console.error('Error loading reports:', error);
            reportsContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load reports. Please try again later.</p>
                </div>
            `;
        } finally {
            isLoading = false;
        }
    }

    function applyFilters() {
        let filtered = [...allReports];

        if (currentSearch) {
            const query = currentSearch.toLowerCase();
            filtered = filtered.filter(report =>
                report.title?.toLowerCase().includes(query) ||
                report.category?.toLowerCase().includes(query) ||
                report.summary?.toLowerCase().includes(query)
            );
        }

        if (currentFilter !== 'all') {
            filtered = filtered.filter(report => report.category === currentFilter);
        }

        displayedReports = filtered;
        currentPage = 1;
        displayReports();
    }

    function displayReports() {
        const startIndex = (currentPage - 1) * reportsPerPage;
        const endIndex = currentPage * reportsPerPage;
        const reportsToShow = displayedReports.slice(startIndex, endIndex);

        resultsTitle.textContent = currentFilter === 'all' ? 'All Reports' : `${currentFilter} Reports`;
        resultsCount.textContent = `${displayedReports.length} report${displayedReports.length !== 1 ? 's' : ''}`;

        if (displayedReports.length === 0) {
            reportsContainer.innerHTML = '';
            noResults.style.display = 'block';
            loadMoreBtn.style.display = 'none';
            return;
        }

        noResults.style.display = 'none';
        reportsContainer.innerHTML = reportsToShow.map(report => createReportCard(report)).join('');
        loadMoreBtn.style.display = endIndex >= displayedReports.length ? 'none' : 'block';
    }

    function createReportCard(report) {
        const rating = report.rating || 0;
        const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));

        return `
            <div class="report-card">
                <div class="report-card-header">
                    <h3 class="report-title">${report.title || 'Untitled Report'}</h3>
                    <span class="report-category">${report.category || 'Other'}</span>
                </div>
                <div class="report-card-body">
                    <div class="report-info">
                        <div class="report-info-item">
                            <i>📅</i>
                            <span>${report.date ? new Date(report.date).toLocaleDateString() : 'Date unknown'}</span>
                        </div>
                        ${report.summary ? `
                        <div class="report-info-item">
                            <i>📝</i>
                            <span>${report.summary.substring(0, 100)}${report.summary.length > 100 ? '...' : ''}</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="report-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-value">${rating.toFixed(1)}</span>
                    </div>
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
            loadReports();
        });
    });

    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = this.value.trim();
            currentPage = 1;
            loadReports();
        }, 300);
    });

    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadReports();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            loadReports();
        }
    });

    loadMoreBtn.addEventListener('click', function() {
        currentPage++;
        displayReports();
    });

    loadReports();
});
