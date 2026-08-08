const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

async function searchProducts(query, options = {}) {
  const params = new URLSearchParams({
    search_terms: query,
    page: String(options.page || 1),
    page_size: String(options.pageSize || 20),
    json: '1'
  });

  if (options.category) params.append('tagtype_0', 'categories');
  if (options.brands) params.append('tag_0', options.brands);

  const response = await fetch(`${BASE_URL}/search?${params}`);
  if (!response.ok) throw new Error(`Open Food Facts error ${response.status}`);
  const data = await response.json();
  return data.products || [];
}

async function getProductByCode(code) {
  const response = await fetch(`${BASE_URL}/product/${encodeURIComponent(code)}.json`);
  if (!response.ok) throw new Error(`Open Food Facts error ${response.status}`);
  const data = await response.json();
  return data.product || null;
}

async function getCategories() {
  const response = await fetch('https://world.openfoodfacts.org/categories.json');
  if (!response.ok) throw new Error(`Open Food Facts error ${response.status}`);
  const data = await response.json();
  return data.categories || [];
}

window.openFoodFactsApi = { searchProducts, getProductByCode, getCategories };
