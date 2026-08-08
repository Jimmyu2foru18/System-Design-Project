/**
 * Nutrition data service for recipe ingredients.
 * Provides estimated nutritional information with local fallback data.
 */

const NUTRITION_API_BASE = 'https://api.edamam.com/api/nutrition-data';
const NUTRITION_APP_ID = process.env.NUTRITION_APP_ID || '';
const NUTRITION_APP_KEY = process.env.NUTRITION_APP_KEY || '';

const localNutritionDB = {
    'chicken breast': { calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0 },
    'beef': { calories: 250, protein: 26, fat: 15, carbs: 0, fiber: 0 },
    'pork': { calories: 242, protein: 27, fat: 14, carbs: 0, fiber: 0 },
    'lamb': { calories: 294, protein: 25, fat: 21, carbs: 0, fiber: 0 },
    'fish': { calories: 206, protein: 22, fat: 12, carbs: 0, fiber: 0 },
    'salmon': { calories: 208, protein: 20, fat: 13, carbs: 0, fiber: 0 },
    'shrimp': { calories: 99, protein: 24, fat: 0.3, carbs: 0.2, fiber: 0 },
    'bacon': { calories: 541, protein: 37, fat: 42, carbs: 1.4, fiber: 0 },
    'rice': { calories: 130, protein: 2.7, fat: 0.3, carbs: 28, fiber: 0.4 },
    'pasta': { calories: 131, protein: 5, fat: 1.1, carbs: 25, fiber: 1.8 },
    'bread': { calories: 265, protein: 9, fat: 3.2, carbs: 49, fiber: 2.7 },
    'potato': { calories: 77, protein: 2, fat: 0.1, carbs: 17, fiber: 2.2 },
    'tomato': { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2 },
    'onion': { calories: 40, protein: 1.1, fat: 0.1, carbs: 9, fiber: 1.7 },
    'garlic': { calories: 149, protein: 6.4, fat: 0.5, carbs: 33, fiber: 2.1 },
    'carrot': { calories: 41, protein: 0.9, fat: 0.2, carbs: 10, fiber: 2.8 },
    'broccoli': { calories: 34, protein: 2.8, fat: 0.4, carbs: 7, fiber: 2.6 },
    'spinach': { calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2 },
    'cheese': { calories: 402, protein: 25, fat: 33, carbs: 1.3, fiber: 0 },
    'milk': { calories: 42, protein: 3.4, fat: 1, carbs: 5, fiber: 0 },
    'egg': { calories: 155, protein: 13, fat: 11, carbs: 1.1, fiber: 0 },
    'butter': { calories: 717, protein: 0.9, fat: 81, carbs: 0.1, fiber: 0 },
    'oil': { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0 },
    'olive oil': { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0 },
    'sugar': { calories: 387, protein: 0, fat: 0, carbs: 100, fiber: 0 },
    'salt': { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
    'pepper': { calories: 251, protein: 10, fat: 3.3, carbs: 64, fiber: 25 },
    'chicken': { calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0 },
    'turkey': { calories: 135, protein: 30, fat: 1, carbs: 0, fiber: 0 },
    'tofu': { calories: 76, protein: 8, fat: 4.8, carbs: 1.9, fiber: 0.3 },
    'beans': { calories: 347, protein: 21, fat: 1.2, carbs: 63, fiber: 16 },
    'lentils': { calories: 116, protein: 9, fat: 0.4, carbs: 20, fiber: 8 },
    'quinoa': { calories: 120, protein: 4.4, fat: 1.9, carbs: 21, fiber: 2.8 },
    'avocado': { calories: 160, protein: 2, fat: 15, carbs: 9, fiber: 7 },
    'banana': { calories: 89, protein: 1.1, fat: 0.3, carbs: 23, fiber: 2.6 },
    'apple': { calories: 52, protein: 0.3, fat: 0.2, carbs: 14, fiber: 2.4 },
    'orange': { calories: 47, protein: 0.9, fat: 0.1, carbs: 12, fiber: 2.4 },
    'lemon': { calories: 29, protein: 1.1, fat: 0.3, carbs: 9, fiber: 2.8 },
    'honey': { calories: 304, protein: 0.3, fat: 0, carbs: 82, fiber: 0 },
    'flour': { calories: 364, protein: 10, fat: 1, carbs: 76, fiber: 2.7 },
    'cream': { calories: 340, protein: 2.1, fat: 36, carbs: 2.8, fiber: 0 },
    'yogurt': { calories: 59, protein: 10, fat: 0.7, carbs: 3.6, fiber: 0 },
    'mushroom': { calories: 22, protein: 3.1, fat: 0.3, carbs: 3.3, fiber: 1 },
    'bell pepper': { calories: 31, protein: 1, fat: 0.3, carbs: 6, fiber: 2.1 },
    'cucumber': { calories: 16, protein: 0.7, fat: 0.1, carbs: 3.6, fiber: 0.5 },
    'lettuce': { calories: 15, protein: 1.4, fat: 0.2, carbs: 2.9, fiber: 1.3 },
    'celery': { calories: 16, protein: 0.7, fat: 0.2, carbs: 3, fiber: 1.6 },
    'ginger': { calories: 80, protein: 1.8, fat: 0.8, carbs: 18, fiber: 2 },
    'cilantro': { calories: 23, protein: 2.1, fat: 0.5, carbs: 3.7, fiber: 2.8 },
    'basil': { calories: 23, protein: 3.2, fat: 0.6, carbs: 2.7, fiber: 1.6 },
    'oregano': { calories: 265, protein: 9, fat: 4.3, carbs: 69, fiber: 42 },
    'thyme': { calories: 276, protein: 9.1, fat: 7.4, carbs: 64, fiber: 37 },
    'rosemary': { calories: 131, protein: 3.3, fat: 5.9, carbs: 21, fiber: 10 },
    'cumin': { calories: 375, protein: 18, fat: 22, carbs: 44, fiber: 11 },
    'paprika': { calories: 282, protein: 14, fat: 13, carbs: 54, fiber: 34 },
    'cinnamon': { calories: 247, protein: 4, fat: 1.2, carbs: 81, fiber: 53 },
    'vanilla': { calories: 288, protein: 0.1, fat: 0.1, carbs: 13, fiber: 0 },
    'chocolate': { calories: 546, protein: 5.4, fat: 31, carbs: 61, fiber: 7 },
    'almonds': { calories: 579, protein: 21, fat: 50, carbs: 22, fiber: 12 },
    'walnuts': { calories: 654, protein: 15, fat: 65, carbs: 14, fiber: 7 },
    'peanuts': { calories: 567, protein: 26, fat: 49, carbs: 16, fiber: 9 },
    'cashews': { calories: 553, protein: 18, fat: 44, carbs: 30, fiber: 3 },
    'pistachios': { calories: 560, protein: 20, fat: 45, carbs: 28, fiber: 10 },
    'sunflower seeds': { calories: 584, protein: 21, fat: 51, carbs: 20, fiber: 9 },
    'chia seeds': { calories: 486, protein: 17, fat: 31, carbs: 42, fiber: 34 },
    'oatmeal': { calories: 389, protein: 17, fat: 7, carbs: 66, fiber: 11 },
    'honey': { calories: 304, protein: 0.3, fat: 0, carbs: 82, fiber: 0 },
    'maple syrup': { calories: 260, protein: 0, fat: 0, carbs: 67, fiber: 0 },
    'vinegar': { calories: 19, protein: 0, fat: 0, carbs: 0.6, fiber: 0 },
    'soy sauce': { calories: 53, protein: 5.6, fat: 0.1, carbs: 5, fiber: 0.5 },
    'coconut milk': { calories: 230, protein: 2.3, fat: 24, carbs: 6, fiber: 2.2 },
    'coconut oil': { calories: 862, protein: 0, fat: 100, carbs: 0, fiber: 0 },
    'sesame oil': { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0 },
    'mustard': { calories: 66, protein: 4.4, fat: 3.6, carbs: 5, fiber: 2.5 },
    'ketchup': { calories: 101, protein: 1.3, fat: 0.1, carbs: 25, fiber: 0.3 },
    'mayonnaise': { calories: 680, protein: 1, fat: 75, carbs: 0.6, fiber: 0 },
    'mustard': { calories: 66, protein: 4.4, fat: 3.6, carbs: 5, fiber: 2.5 },
    'salsa': { calories: 36, protein: 1.5, fat: 0.2, carbs: 7, fiber: 1.3 },
    'hummus': { calories: 166, protein: 7.9, fat: 9.6, carbs: 14, fiber: 6 },
    'tortilla': { calories: 312, protein: 8, fat: 8, carbs: 52, fiber: 2.5 },
    'pizza': { calories: 266, protein: 11, fat: 10, carbs: 33, fiber: 2.5 },
    'burger': { calories: 540, protein: 28, fat: 32, carbs: 30, fiber: 1.5 },
    'hot dog': { calories: 290, protein: 10, fat: 26, carbs: 6, fiber: 0 },
    'fries': { calories: 312, protein: 3.4, fat: 15, carbs: 41, fiber: 3.8 },
    'chips': { calories: 536, protein: 7, fat: 35, carbs: 53, fiber: 4.4 },
    'cookie': { calories: 502, protein: 5, fat: 25, carbs: 68, fiber: 1.5 },
    'cake': { calories: 371, protein: 5, fat: 15, carbs: 52, fiber: 1.2 },
    'ice cream': { calories: 207, protein: 3.5, fat: 11, carbs: 24, fiber: 0.7 },
    'coffee': { calories: 2, protein: 0.3, fat: 0, carbs: 0, fiber: 0 },
    'tea': { calories: 1, protein: 0, fat: 0, carbs: 0.3, fiber: 0 },
    'wine': { calories: 83, protein: 0.1, fat: 0, carbs: 2.6, fiber: 0 },
    'beer': { calories: 43, protein: 0.5, fat: 0, carbs: 3.5, fiber: 0 },
    'water': { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
};

const CACHE_TTL = 60 * 60 * 1000;
const nutritionCache = new Map();

/**
 * Get nutritional data for a single ingredient.
 * @param {string} ingredient - The ingredient name
 * @param {number} [quantity=100] - Quantity in grams
 * @returns {Promise<Object|null>} Nutritional data object
 */
async function getIngredientNutrition(ingredient, quantity = 100) {
    const cacheKey = `${ingredient.toLowerCase()}-${quantity}`;
    const cached = nutritionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const localData = getLocalNutritionData(ingredient, quantity);
    if (localData) {
        nutritionCache.set(cacheKey, { data: localData, timestamp: Date.now() });
        return localData;
    }

    if (NUTRITION_APP_ID && NUTRITION_APP_KEY) {
        try {
            const url = `${NUTRITION_API_BASE}?app_id=${NUTRITION_APP_ID}&app_key=${NUTRITION_APP_KEY}&ingr=${encodeURIComponent(ingredient)}&amount=${quantity}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const result = {
                    calories: Math.round(data.calories || 0),
                    protein: Math.round((data.totalNutrients?.PROCNT?.quantity || 0) * 10) / 10,
                    fat: Math.round((data.totalNutrients?.FAT?.quantity || 0) * 10) / 10,
                    carbs: Math.round((data.totalNutrients?.CHOCDF?.quantity || 0) * 10) / 10,
                    fiber: Math.round((data.totalNutrients?.FIBTG?.quantity || 0) * 10) / 10
                };
                nutritionCache.set(cacheKey, { data: result, timestamp: Date.now() });
                return result;
            }
        } catch (error) {
            console.error('Error fetching nutrition from API:', error);
        }
    }

    const estimated = estimateNutrition(ingredient, quantity);
    nutritionCache.set(cacheKey, { data: estimated, timestamp: Date.now() });
    return estimated;
}

/**
 * Get local nutrition data for common ingredients.
 * @param {string} ingredient - The ingredient name
 * @param {number} quantity - Quantity in grams
 * @returns {Object|null} Nutritional data or null
 */
function getLocalNutritionData(ingredient, quantity) {
    const key = ingredient.toLowerCase().trim();
    const data = localNutritionDB[key];
    if (!data) return null;

    const multiplier = quantity / 100;
    return {
        calories: Math.round(data.calories * multiplier),
        protein: Math.round(data.protein * multiplier * 10) / 10,
        fat: Math.round(data.fat * multiplier * 10) / 10,
        carbs: Math.round(data.carbs * multiplier * 10) / 10,
        fiber: Math.round(data.fiber * multiplier * 10) / 10
    };
}

/**
 * Estimate nutrition for unknown ingredients.
 * @param {string} ingredient - The ingredient name
 * @param {number} quantity - Quantity in grams
 * @returns {Object} Estimated nutritional data
 */
function estimateNutrition(ingredient, quantity) {
    const isProtein = /chicken|beef|pork|lamb|fish|salmon|shrimp|bacon|turkey|tofu|egg/i.test(ingredient);
    const isCarb = /rice|pasta|bread|potato|flour|oatmeal|quinoa/i.test(ingredient);
    const isVeggie = /broccoli|spinach|carrot|tomato|onion|garlic|lettuce|celery|pepper|cucumber/i.test(ingredient);
    const isFat = /oil|butter|cream|cheese|chocolate|mayonnaise/i.test(ingredient);

    let calories = 50;
    let protein = 2;
    let fat = 1;
    let carbs = 5;
    let fiber = 1;

    if (isProtein) {
        calories = 150;
        protein = 25;
        fat = 5;
        carbs = 2;
        fiber = 0;
    } else if (isCarb) {
        calories = 120;
        protein = 3;
        fat = 1;
        carbs = 25;
        fiber = 2;
    } else if (isVeggie) {
        calories = 25;
        protein = 1;
        fat = 0.2;
        carbs = 5;
        fiber = 2;
    } else if (isFat) {
        calories = 700;
        protein = 0.5;
        fat = 75;
        carbs = 2;
        fiber = 0;
    }

    const multiplier = quantity / 100;
    return {
        calories: Math.round(calories * multiplier),
        protein: Math.round(protein * multiplier * 10) / 10,
        fat: Math.round(fat * multiplier * 10) / 10,
        carbs: Math.round(carbs * multiplier * 10) / 10,
        fiber: Math.round(fiber * multiplier * 10) / 10
    };
}

/**
 * Calculate total nutrition for a recipe.
 * @param {Array} ingredients - Array of ingredient objects with name and quantity
 * @returns {Promise<Object>} Total nutritional data
 */
async function calculateRecipeNutrition(ingredients) {
    const totals = { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };

    const promises = ingredients.map(async (ing) => {
        const quantity = ing.quantity ? parseInt(ing.quantity) : 100;
        const nutrition = await getIngredientNutrition(ing.name, quantity);
        return nutrition;
    });

    const results = await Promise.all(promises);
    results.forEach(result => {
        totals.calories += result.calories;
        totals.protein += result.protein;
        totals.fat += result.fat;
        totals.carbs += result.carbs;
        totals.fiber += result.fiber;
    });

    return {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fiber: Math.round(totals.fiber * 10) / 10
    };
}

/**
 * Format nutrition data for display.
 * @param {Object} nutrition - Nutrition data object
 * @returns {string} Formatted HTML string
 */
function formatNutritionDisplay(nutrition) {
    return `
        <div class="nutrition-info">
            <span class="nutrition-item" title="Calories">&#128168; ${nutrition.calories} kcal</span>
            <span class="nutrition-item" title="Protein">&#129358; ${nutrition.protein}g</span>
            <span class="nutrition-item" title="Fat">&#129367; ${nutrition.fat}g</span>
            <span class="nutrition-item" title="Carbs">&#127804; ${nutrition.carbs}g</span>
            <span class="nutrition-item" title="Fiber">&#127807; ${nutrition.fiber}g</span>
        </div>
    `;
}

window.getIngredientNutrition = getIngredientNutrition;
window.calculateRecipeNutrition = calculateRecipeNutrition;
window.formatNutritionDisplay = formatNutritionDisplay;
window.localNutritionDB = localNutritionDB;
