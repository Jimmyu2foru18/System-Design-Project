const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

const FALLBACK_PRODUCTS = [
  {
    product_name: 'Organic Rolled Oats',
    brands: 'Nature\'s Path',
    categories: 'Breakfast, Cereals, Oats',
    nutrition_grade_fr: 'a',
    nutriments: { energy_100g: 379 },
    image_front_small_url: 'https://static.openfoodfacts.org/images/products/737/064/051/4226/front_en.3.100.jpg'
  },
  {
    product_name: 'Almond Milk',
    brands: 'Silk',
    categories: 'Beverages, Milk substitutes, Almond milk',
    nutrition_grade_fr: 'b',
    nutriments: { energy_100g: 30 },
    image_front_small_url: 'https://static.openfoodfacts.org/images/products/0256235210158/front_en.3.100.jpg'
  },
  {
    product_name: 'Greek Yogurt',
    brands: 'Fage',
    categories: 'Dairy, Yogurts, Greek yogurt',
    nutrition_grade_fr: 'a',
    nutriments: { energy_100g: 59 },
    image_front_small_url: 'https://static.openfoodfacts.org/images/products/0750119210106/front_en.3.100.jpg'
  },
  {
    product_name: 'Whole Wheat Bread',
    brands: 'Dave\'s Killer Bread',
    categories: 'Grains, Bread, Whole wheat bread',
    nutrition_grade_fr: 'b',
    nutriments: { energy_100g: 247 },
    image_front_small_url: 'https://static.openfoodfacts.org/images/products/0783429165482/front_en.3.100.jpg'
  },
  {
    product_name: 'Dark Chocolate 85%',
    brands: 'Lindt',
    categories: 'Snacks, Chocolate, Dark chocolate',
    nutrition_grade_fr: 'c',
    nutriments: { energy_100g: 598 },
    image_front_small_url: 'https://static.openfoodfacts.org/images/products/0737621560106/front_en.3.100.jpg'
  },
  {
    product_name: 'Quinoa',
    brands: 'Ancient Harvest',
    categories: 'Grains, Quinoa',
    nutrition_grade_fr: 'a',
    nutriments: { energy_100g: 368 },
    image_front_small_url: 'https://static.openfoodfacts.org/images/products/016000123456/front_en.3.100.jpg'
  }
];

async function searchProducts(query, options = {}) {
  const params = new URLSearchParams({
    search_terms: query,
    page: String(options.page || 1),
    page_size: String(options.pageSize || 20),
    json: '1'
  });

  if (options.category) params.append('tagtype_0', 'categories');
  if (options.brands) params.append('tag_0', options.brands);

  try {
    const response = await fetch(`${BASE_URL}/search?${params}`);
    if (!response.ok) throw new Error(`Open Food Facts error ${response.status}`);
    const data = await response.json();
    const products = data.products || [];
    if (products.length > 0) return products;
  } catch (error) {
    console.warn('Open Food Facts search failed, using fallback:', error.message);
  }

  const lower = (query || '').toLowerCase();
  return FALLBACK_PRODUCTS.filter(p =>
    !lower ||
    (p.product_name || '').toLowerCase().includes(lower) ||
    (p.brands || '').toLowerCase().includes(lower) ||
    (p.categories || '').toLowerCase().includes(lower)
  );
}

async function getProductByCode(code) {
  try {
    const response = await fetch(`${BASE_URL}/product/${encodeURIComponent(code)}.json`);
    if (!response.ok) throw new Error(`Open Food Facts error ${response.status}`);
    const data = await response.json();
    return data.product || null;
  } catch (error) {
    console.warn('Open Food Facts product lookup failed:', error.message);
    return null;
  }
}

async function getCategories() {
  try {
    const response = await fetch('https://world.openfoodfacts.org/categories.json');
    if (!response.ok) throw new Error(`Open Food Facts error ${response.status}`);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.warn('Open Food Facts categories failed:', error.message);
    return [
      { name: 'Beverages' },
      { name: 'Snacks' },
      { name: 'Dairy' },
      { name: 'Meat' },
      { name: 'Vegetables' },
      { name: 'Fruits' },
      { name: 'Grains' }
    ];
  }
}

window.openFoodFactsApi = { searchProducts, getProductByCode, getCategories };
