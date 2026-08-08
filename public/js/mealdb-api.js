// mealdb-api.js - Optimized integration with TheMealDB API

const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map();

function getCached(key) {
    const item = cache.get(key);
    if (item && Date.now() - item.timestamp < CACHE_TTL) {
        return item.data;
    }
    cache.delete(key);
    return null;
}

function setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithCache(url, key) {
    const cached = getCached(key);
    if (cached) return cached;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    setCache(key, data);
    return data;
}

async function fetchTrendingRecipes() {
    try {
        const promises = Array.from({ length: 6 }, () => 
            fetchWithCache(`${API_BASE_URL}/random.php`, `random-${Date.now()}-${Math.random()}`)
        );
        const results = await Promise.all(promises);
        const recipes = results
            .filter(r => r.meals && r.meals.length)
            .map(r => formatMealDbRecipe(r.meals[0]));
        setCache('trending', recipes);
        return recipes;
    } catch (error) {
        console.error('Error fetching trending recipes:', error);
        return getCached('trending') || [];
    }
}

async function fetchFeaturedRecipes() {
    try {
        const data = await fetchWithCache(`${API_BASE_URL}/filter.php?c=Dessert`, 'featured');
        if (!data.meals || !data.meals.length) return [];
        
        const promises = data.meals.slice(0, 6).map(meal =>
            fetchWithCache(`${API_BASE_URL}/lookup.php?i=${meal.idMeal}`, `featured-${meal.idMeal}`)
        );
        const results = await Promise.all(promises);
        return results
            .filter(r => r.meals && r.meals.length)
            .map(r => formatMealDbRecipe(r.meals[0]));
    } catch (error) {
        console.error('Error fetching featured recipes:', error);
        return getCached('featured') || [];
    }
}

async function fetchRecommendedRecipes() {
    try {
        const data = await fetchWithCache(`${API_BASE_URL}/filter.php?c=Chicken`, 'recommended');
        if (!data.meals || !data.meals.length) return [];
        
        const promises = data.meals.slice(0, 6).map(meal =>
            fetchWithCache(`${API_BASE_URL}/lookup.php?i=${meal.idMeal}`, `recommended-${meal.idMeal}`)
        );
        const results = await Promise.all(promises);
        return results
            .filter(r => r.meals && r.meals.length)
            .map(r => formatMealDbRecipe(r.meals[0]));
    } catch (error) {
        console.error('Error fetching recommended recipes:', error);
        return getCached('recommended') || [];
    }
}

async function searchRecipes(query) {
    try {
        const data = await fetchWithCache(`${API_BASE_URL}/search.php?s=${encodeURIComponent(query)}`, `search-${query}`);
        if (!data.meals || !data.meals.length) return [];
        return data.meals.map(meal => formatMealDbRecipe(meal));
    } catch (error) {
        console.error('Error searching recipes:', error);
        return [];
    }
}

async function getRecipeById(id) {
    try {
        const data = await fetchWithCache(`${API_BASE_URL}/lookup.php?i=${id}`, `recipe-${id}`);
        if (data.meals && data.meals.length) return formatMealDbRecipe(data.meals[0]);
        return null;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        return null;
    }
}

async function getRecipesByCategory(category) {
    try {
        const data = await fetchWithCache(`${API_BASE_URL}/filter.php?c=${encodeURIComponent(category)}`, `category-${category}`);
        if (!data.meals || !data.meals.length) return [];
        
        const promises = data.meals.slice(0, 12).map(meal =>
            fetchWithCache(`${API_BASE_URL}/lookup.php?i=${meal.idMeal}`, `cat-${category}-${meal.idMeal}`)
        );
        const results = await Promise.all(promises);
        return results
            .filter(r => r.meals && r.meals.length)
            .map(r => formatMealDbRecipe(r.meals[0]));
    } catch (error) {
        console.error('Error fetching recipes by category:', error);
        return [];
    }
}

async function getCategories() {
    try {
        const data = await fetchWithCache(`${API_BASE_URL}/categories.php`, 'categories');
        return data.categories || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

async function fetchRecipesByLetter(letter) {
    try {
        const data = await fetchWithCache(`${API_BASE_URL}/search.php?f=${letter}`, `letter-${letter}`);
        if (!data.meals || !data.meals.length) return [];
        return data.meals.map(meal => formatMealDbRecipe(meal));
    } catch (error) {
        console.error('Error fetching recipes by letter:', error);
        return [];
    }
}

function formatMealDbRecipe(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredients.push({ name: ingredient, quantity: measure || 'to taste' });
        }
    }
    
    const instructions = meal.strInstructions
        .split('\r\n')
        .filter(step => step.trim())
        .map((text, index) => ({ step: index + 1, instruction: text.trim() }));
    
    const difficulty = ingredients.length > 10 || instructions.length > 7 ? 'Hard' 
        : ingredients.length > 5 || instructions.length > 4 ? 'Medium' : 'Easy';
    
    const cookTime = Math.max(15, ingredients.length * 5 + instructions.length * 3);
    
    const categories = [];
    if (meal.strCategory) categories.push(meal.strCategory);
    if (meal.strArea) categories.push(meal.strArea);
    if (meal.strTags) meal.strTags.split(',').forEach(tag => tag.trim() && categories.push(tag.trim()));
    
    const meatIngredients = ['chicken', 'beef', 'pork', 'lamb', 'meat', 'fish', 'seafood', 'shrimp', 'bacon'];
    const isVegetarian = !ingredients.some(ing => meatIngredients.some(meat => ing.name.toLowerCase().includes(meat)));
    
    return {
        id: meal.idMeal,
        title: meal.strMeal,
        description: `A delicious ${meal.strCategory} recipe from ${meal.strArea} cuisine.`,
        image: meal.strMealThumb,
        cookTime,
        servings: 4,
        difficulty,
        rating: (Math.random() * 2 + 3).toFixed(1),
        categories,
        dietaryCategories: isVegetarian ? ['vegetarian'] : [],
        ingredients,
        instructions,
        author: { name: 'TheMealDB', id: 'mealdb' }
    };
}

window.fetchTrendingRecipes = fetchTrendingRecipes;
window.fetchFeaturedRecipes = fetchFeaturedRecipes;
window.fetchRecommendedRecipes = fetchRecommendedRecipes;
window.searchRecipes = searchRecipes;
window.getRecipeById = getRecipeById;
window.getRecipesByCategory = getRecipesByCategory;
window.getCategories = getCategories;
window.fetchRecipesByLetter = fetchRecipesByLetter;
