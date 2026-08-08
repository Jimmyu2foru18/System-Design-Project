const API_BASE = 'https://api.edamam.com/api/nutrition-details';
const DATA_API_BASE = 'https://api.edamam.com/api/nutrition-data';

async function analyzeRecipe(recipeTitle, ingredients) {
  const appId = window.RECSPICY_CONFIG?.NUTRITION_APP_ID || '';
  const appKey = window.RECSPICY_CONFIG?.NUTRITION_APP_KEY || '';

  if (!appId || !appKey) {
    throw new Error('Missing Edamam credentials');
  }

  const ingredientLines = Array.isArray(ingredients)
    ? ingredients.map(i => typeof i === 'string' ? i : i.name || '').filter(Boolean)
    : [];

  if (!ingredientLines.length) {
    throw new Error('No ingredients provided');
  }

  const url = `${API_BASE}?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: recipeTitle || 'Recipe', ingr: ingredientLines })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Edamam error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return {
    calories: data.calories ?? 0,
    protein: Math.round((data.totalNutrients?.PROCNT?.quantity || 0) * 10) / 10,
    fat: Math.round((data.totalNutrients?.FAT?.quantity || 0) * 10) / 10,
    carbs: Math.round((data.totalNutrients?.CHOCDF?.quantity || 0) * 10) / 10,
    fiber: Math.round((data.totalNutrients?.FIBTG?.quantity || 0) * 10) / 10,
    source: 'edamam'
  };
}

async function analyzeIngredient(ingredient, quantity = 100) {
  const appId = window.RECSPICY_CONFIG?.NUTRITION_APP_ID || '';
  const appKey = window.RECSPICY_CONFIG?.NUTRITION_APP_KEY || '';

  if (!appId || !appKey) {
    throw new Error('Missing Edamam credentials');
  }

  const url = `${DATA_API_BASE}?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}&ingr=${encodeURIComponent(ingredient)}&amount=${encodeURIComponent(String(quantity))}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Edamam error ${response.status}`);
  const data = await response.json();
  return {
    calories: Math.round(data.calories || 0),
    protein: Math.round((data.totalNutrients?.PROCNT?.quantity || 0) * 10) / 10,
    fat: Math.round((data.totalNutrients?.FAT?.quantity || 0) * 10) / 10,
    carbs: Math.round((data.totalNutrients?.CHOCDF?.quantity || 0) * 10) / 10,
    fiber: Math.round((data.totalNutrients?.FIBTG?.quantity || 0) * 10) / 10,
    source: 'edamam'
  };
}

window.edamamApi = { analyzeRecipe, analyzeIngredient };
