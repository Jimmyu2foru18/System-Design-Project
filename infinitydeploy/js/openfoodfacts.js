document.addEventListener('DOMContentLoaded', () => {
    let allProducts = [];
    let displayedProducts = [];
    let currentFilter = 'all';
    let currentSearch = '';
    const productsPerPage = 12;
    let currentPage = 1;
    let isLoading = false;

    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const resultsTitle = document.getElementById('results-title');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const categoryKeywords = {
        beverages: ['beverage', 'drink', 'juice', 'water', 'soda', 'tea', 'coffee', 'milk', 'beer', 'wine'],
        snacks: ['snack', 'chip', 'cookie', 'cracker', 'chocolate', 'candy', 'bar', 'popcorn'],
        dairy: ['dairy', 'milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream'],
        meat: ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'sausage', 'bacon', 'ham'],
        vegetables: ['vegetable', 'broccoli', 'carrot', 'tomato', 'spinach', 'lettuce', 'pepper', 'onion'],
        fruits: ['fruit', 'apple', 'banana', 'orange', 'berry', 'grape', 'melon', 'strawberry'],
        grains: ['grain', 'rice', 'pasta', 'bread', 'cereal', 'oat', 'wheat', 'flour']
    };

    async function loadProducts() {
        if (isLoading) return;
        isLoading = true;
        currentPage = 1;

        productsContainer.innerHTML = '<div class="loading-spinner"></div>';
        noResults.style.display = 'none';
        loadMoreBtn.style.display = 'none';

        try {
            const options = { page: 1, pageSize: 50 };
            if (currentFilter !== 'all' && categoryKeywords[currentFilter]) {
                options.category = categoryKeywords[currentFilter][0];
            }

            const products = await window.openFoodFactsApi.searchProducts(currentSearch || 'food', options);
            allProducts = products;
            applyFilters();
        } catch (error) {
            console.error('Error loading products:', error);
            productsContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load products. Please try again later.</p>
                </div>
            `;
        } finally {
            isLoading = false;
        }
    }

    function applyFilters() {
        let filtered = [...allProducts];

        if (currentSearch) {
            const query = currentSearch.toLowerCase();
            filtered = filtered.filter(product =>
                product.product_name?.toLowerCase().includes(query) ||
                product.brands?.toLowerCase().includes(query) ||
                product.categories?.toLowerCase().includes(query)
            );
        }

        if (currentFilter !== 'all' && categoryKeywords[currentFilter]) {
            const keywords = categoryKeywords[currentFilter];
            filtered = filtered.filter(product => {
                const text = `${product.product_name || ''} ${product.categories || ''} ${product.brands || ''}`.toLowerCase();
                return keywords.some(keyword => text.includes(keyword));
            });
        }

        displayedProducts = filtered;
        currentPage = 1;
        displayProducts();
    }

    function displayProducts() {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = currentPage * productsPerPage;
        const productsToShow = displayedProducts.slice(startIndex, endIndex);

        resultsTitle.textContent = currentFilter === 'all' ? 'All Products' : `${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)} Products`;
        resultsCount.textContent = `${displayedProducts.length} product${displayedProducts.length !== 1 ? 's' : ''}`;

        if (displayedProducts.length === 0) {
            productsContainer.innerHTML = '';
            noResults.style.display = 'block';
            loadMoreBtn.style.display = 'none';
            return;
        }

        noResults.style.display = 'none';
        productsContainer.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
        loadMoreBtn.style.display = endIndex >= displayedProducts.length ? 'none' : 'block';
    }

    function createProductCard(product) {
        const image = product.image_front_small_url || product.image_front_url || product.image_url || '';
        const brand = product.brands || 'Unknown brand';
        const name = product.product_name || 'Unnamed product';

        const nutritionBadges = [];
        if (product.nutrition_grade_fr) {
            nutritionBadges.push(`Grade: ${product.nutrition_grade_fr.toUpperCase()}`);
        }
        if (product.nutriments?.energy_100g) {
            nutritionBadges.push(`${Math.round(product.nutriments.energy_100g)} kcal/100g`);
        }
        if (product.categories) {
            const cats = product.categories.split(',').slice(0, 2);
            nutritionBadges.push(...cats.map(c => c.trim()));
        }

        return `
            <div class="product-card">
                <div class="product-image-container">
                    ${image ? `<img src="${image}" alt="${name}" class="product-image" loading="lazy">` : '<span>No image</span>'}
                </div>
                <div class="product-card-body">
                    <h3 class="product-name">${name}</h3>
                    <p class="product-brand">${brand}</p>
                    <div class="product-nutrition">
                        ${nutritionBadges.slice(0, 3).map(badge => `<span class="nutrition-badge">${badge}</span>`).join('')}
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
            loadProducts();
        });
    });

    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = this.value.trim();
            currentPage = 1;
            loadProducts();
        }, 300);
    });

    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadProducts();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            loadProducts();
        }
    });

    loadMoreBtn.addEventListener('click', function() {
        currentPage++;
        displayProducts();
    });

    loadProducts();
});
