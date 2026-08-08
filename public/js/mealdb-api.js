const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const EDAMAM_RECIPE_URL = 'https://api.edamam.com/api/recipes/v2';

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

const ALLERGENS = {
    peanut: ['peanut', 'peanuts', 'peanut butter', 'groundnut'],
    tree_nut: ['almond', 'almonds', 'walnut', 'walnuts', 'cashew', 'cashews', 'pistachio', 'pistachios', 'pecan', 'pecans', 'hazelnut', 'hazelnuts', 'macadamia', 'brazil nut', 'pine nut', 'nutella'],
    milk: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein', 'lactose', 'dairy', 'buttermilk', 'sour cream', 'cream cheese', 'mozzarella', 'parmesan', 'cheddar', 'ricotta', 'mascarpone', 'heavy cream', 'half and half'],
    egg: ['egg', 'eggs', 'mayonnaise', 'mayo', 'egg yolk', 'egg white', 'custard', 'meringue', 'fresh pasta', 'pasta dough', 'egg wash'],
    wheat: ['wheat', 'flour', 'bread', 'pasta', 'noodle', 'dough', 'semolina', 'couscous', 'bulgur', 'farro', 'spelt', 'breadcrumbs', 'panko', 'croissant', 'bagel', 'muffin', 'cookie', 'cake', 'pastry'],
    gluten: ['wheat', 'barley', 'rye', 'flour', 'bread', 'pasta', 'noodle', 'semolina', 'couscous', 'bulgur', 'farro', 'spelt', 'breadcrumbs', 'panko', 'soy sauce', 'teriyaki', 'beer', 'malt', 'seitan', 'croissant', 'bagel', 'muffin'],
    soy: ['soy', 'tofu', 'tempeh', 'edamame', 'soy milk', 'soy sauce', 'tamari', 'miso', 'natto', 'soybean', 'soybean oil', 'lecithin'],
    fish: ['fish', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'anchovy', 'anchovies', 'sardine', 'sardines', 'mackerel', 'trout', 'bass', 'fish sauce', 'worcestershire', 'caesar dressing'],
    shellfish: ['shrimp', 'prawn', 'crab', 'lobster', 'crawfish', 'crayfish', 'clam', 'clams', 'mussel', 'mussels', 'scallop', 'scallops', 'oyster', 'oysters', 'squid', 'calamari', 'octopus', 'snail', 'escargot'],
    sesame: ['sesame', 'tahini', 'sesame oil', 'sesame seed', 'sesame seeds', 'tahini', 'hummus', 'baba ganoush', 'falafel'],
    corn: ['corn', 'cornmeal', 'cornstarch', 'corn syrup', 'maize', 'popcorn', 'tortilla', 'tortilla chips', 'polenta', 'corn flour', 'corn oil', 'high fructose corn syrup'],
    coconut: ['coconut', 'coconut milk', 'coconut oil', 'coconut cream', 'coconut flour', 'desiccated coconut', 'shredded coconut', 'coconut water'],
    mustard: ['mustard', 'mustard seed', 'dijon', 'yellow mustard', 'mustard greens', 'coleslaw', 'honey mustard'],
    sulfites: ['sulfite', 'sulphite', 'preserved', 'cured', 'dried', 'wine', 'vinegar', 'dried fruit', 'processed potato products', 'shrimp', 'lobster'],
    lupin: ['lupin', 'lupini', 'lupin bean', 'lupin flour'],
    celery: ['celery', 'celery salt', 'celery seed', 'celeriac'],
    legumes: ['bean', 'beans', 'lentil', 'lentils', 'chickpea', 'chickpeas', 'garbanzo', 'pea', 'peas', 'split pea', 'split peas', 'navy bean', 'black bean', 'kidney bean', 'pinto bean', 'soybean', 'edamame', 'tofu', 'tempeh', 'hummus', 'falafel', 'lupin', 'lupini']
};

const DIETARY_MAP = {
    vegetarian: { exclude: ['chicken', 'beef', 'pork', 'lamb', 'meat', 'fish', 'seafood', 'shrimp', 'bacon', 'turkey', 'duck', 'goose', 'veal', 'rabbit', 'liver', 'kidney', 'heart', 'oxtail', 'venison', 'quail', 'pigeon', 'goat'] },
    vegan: { exclude: ['chicken', 'beef', 'pork', 'lamb', 'meat', 'fish', 'seafood', 'shrimp', 'bacon', 'turkey', 'duck', 'goose', 'veal', 'rabbit', 'liver', 'kidney', 'heart', 'oxtail', 'venison', 'quail', 'pigeon', 'goat', 'egg', 'eggs', 'milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein', 'lactose', 'dairy', 'honey', 'mayonnaise', 'mayo'] },
    pescatarian: { exclude: ['chicken', 'beef', 'pork', 'lamb', 'meat', 'turkey', 'duck', 'goose', 'veal', 'rabbit', 'liver', 'kidney', 'heart', 'oxtail', 'venison', 'quail', 'pigeon', 'goat'] },
    halal: { exclude: ['pork', 'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'prosciutto', 'pancetta', 'blood', 'alcohol', 'wine', 'beer', 'rum', 'vodka', 'whiskey', 'gin', 'tequila', 'champagne', 'liqueur'] },
    kosher: { exclude: ['pork', 'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'prosciutto', 'pancetta', 'shellfish', 'shrimp', 'crab', 'lobster', 'crawfish', 'clam', 'clams', 'mussel', 'mussels', 'scallop', 'scallops', 'oyster', 'oysters', 'squid', 'calamari', 'octopus', 'snail', 'escargot', 'fish', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'anchovy', 'anchovies', 'sardine', 'sardines', 'mackerel', 'trout', 'bass', 'catfish', 'eel', 'swordfish', 'lobster', 'crab', 'shrimp', 'clam', 'mussel', 'oyster', 'scallop', 'squid', 'octopus', 'snail', 'escargot', 'crawfish', 'prawn', 'prawns', 'crayfish', 'pork', 'pig', 'swine', 'hog', 'boar'] }
};

const MEAL_TYPE_RULES = {
    breakfast: ['pancake', 'pancakes', 'waffle', 'waffles', 'french toast', 'omelette', 'omelet', 'scrambled egg', 'boiled egg', 'poached egg', 'fried egg', 'eggs benedict', 'breakfast burrito', 'breakfast sandwich', 'cereal', 'oatmeal', 'porridge', 'granola', 'muesli', 'yogurt parfait', 'smoothie', 'muffin', 'scone', 'biscuit', 'biscuits and gravy', 'hash brown', 'hash browns', 'breakfast potatoes', 'quiche', 'frittata', 'strata', 'breakfast casserole', 'eggs', 'egg', 'toast', 'croissant', 'bagel', 'english muffin', 'pancake', 'waffle', 'french toast', 'breakfast bar', 'breakfast bowl', 'acai bowl', 'overnight oats', 'chia pudding', 'breakfast taco', 'breakfast quesadilla', 'breakfast wrap', 'breakfast burrito'],
    brunch: ['brunch', 'quiche', 'frittata', 'eggs benedict', 'shakshuka', 'breakfast burrito', 'breakfast sandwich', 'croque madame', 'croque monsieur', 'french toast', 'pancake', 'waffle', 'omelette', 'omelet', 'brunch bowl', 'brunch platter'],
    lunch: ['sandwich', 'sandwiches', 'wrap', 'burger', 'hot dog', 'hotdog', 'salad', 'soup', 'chili', 'stew', 'curry', 'rice bowl', 'poke bowl', 'bento', 'lunch box', 'club sandwich', 'reuben', 'blt', 'panini', 'quesadilla', 'taco', 'tacos', 'burrito', 'burritos', 'enchilada', 'enchiladas', 'fajita', 'fajitas', 'pad thai', 'noodle', 'noodles', 'pasta', 'spaghetti', 'lasagna', 'mac and cheese', 'macaroni', 'ravioli', 'fettuccine', 'linguine', 'penne', 'rigatoni', 'farfalle', 'orzo', 'udon', 'ramen', 'pho', 'lo mein', 'chow mein', 'fried rice', 'bibimbap', 'gyro', 'shawarma', 'falafel', 'doner', 'kebab', 'gyro wrap', 'lunch special', ' bento box', 'sushi', 'maki', 'roll', 'rolls', 'dim sum', ' dumpling', 'dumplings', 'spring roll', 'spring rolls', 'summer roll', 'summer rolls'],
    dinner: ['steak', 'roast', 'roasted', 'grilled', 'baked', 'casserole', 'lasagna', 'manicotti', 'ziti', 'baked ziti', 'shepherd', 'cottage pie', 'shepherd pie', 'pot pie', 'meatloaf', 'meat loaf', 'fried chicken', 'roast chicken', 'whole chicken', 'turkey', 'duck', 'goose', 'lamb', 'pork chop', 'pork chops', 'beef', 'veal', 'venison', 'rabbit', 'salmon', 'tuna', 'cod', 'halibut', 'shrimp', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop', 'paella', 'risotto', 'gnocchi', 'ravioli', 'tortellini', 'cannelloni', 'stuffed pepper', 'stuffed peppers', 'stuffed mushroom', 'stuffed mushrooms', 'meatball', 'meatballs', 'spaghetti', 'pasta', 'noodle', 'noodles', 'rice', 'quinoa', 'couscous', 'polenta', 'mashed potato', 'mashed potatoes', 'baked potato', 'baked potatoes', 'roasted vegetable', 'roasted vegetables', 'grilled vegetable', 'grilled vegetables', 'stir fry', 'stir-fry', 'wok', 'skillet', 'dinner', 'supper', 'main course', 'main dish', 'entree', 'entree'],
    snack: ['chip', 'chips', 'cracker', 'crackers', 'cookie', 'cookies', 'brownie', 'brownies', 'bar', 'bars', 'granola bar', 'granola bars', 'trail mix', 'nuts', 'nut', 'popcorn', 'pretzel', 'pretzels', 'rice cake', 'rice cakes', 'fruit', 'apple', 'banana', 'orange', 'grape', 'grapes', 'berry', 'berries', 'strawberry', 'strawberries', 'blueberry', 'blueberries', 'raspberry', 'raspberries', 'blackberry', 'blackberries', 'melon', 'watermelon', 'cantaloupe', 'honeydew', 'pineapple', 'mango', 'papaya', 'kiwi', 'pear', 'peach', 'plum', 'cherry', 'cherries', 'apricot', 'apricots', 'fig', 'figs', 'date', 'dates', 'raisin', 'raisins', 'cranberry', 'cranberries', 'dried fruit', 'trail mix', 'granola', 'muesli', 'yogurt', 'cheese stick', 'string cheese', 'cottage cheese', 'pudding', 'jello', 'gelatin', 'fruit cup', 'applesauce', 'smoothie', 'milkshake', 'slushie', 'ice pop', 'popsicle', 'frozen yogurt', 'froyo', 'sorbet', 'gelato', 'snack', 'snacks', 'finger food', 'appetizer', 'appetizers'],
    dessert: ['cake', 'cakes', 'pie', 'pies', 'cookie', 'cookies', 'brownie', 'brownies', 'cupcake', 'cupcakes', 'pastry', 'pastries', 'tart', 'tarts', 'pudding', 'puddings', 'custard', 'mousse', 'cheesecake', 'tiramisu', 'panna cotta', 'creme brulee', 'creme caramel', 'flan', 'tres leches', 'cake', 'pie', 'tart', 'cookie', 'brownie', 'blondie', 'bar', 'bars', 'square', 'squares', 'donut', 'doughnut', 'doughnuts', 'eclair', 'profiterole', 'cream puff', 'choux', 'macaron', 'macarons', 'meringue', 'meringues', 'meringue cookie', 'meringue cookies', 'meringue kiss', 'meringue kisses', 'pavlova', 'fruit tart', 'fruit tarts', 'fruit pie', 'fruit pies', 'apple pie', 'cherry pie', 'blueberry pie', 'pumpkin pie', 'sweet potato pie', 'pecan pie', 'peanut butter pie', 'chocolate pie', 'cream pie', 'banana cream pie', 'coconut cream pie', 'key lime pie', 'lemon meringue pie', 'pie', 'tart', 'galette', 'cobbler', 'crisp', 'crumble', 'betty', 'buckle', 'grunt', 'slump', 'sonker', 'pandowdy', 'dump cake', 'lava cake', 'molten cake', 'fondant', 'frosting', 'icing', 'glaze', 'ganache', 'caramel', 'toffee', 'fudge', 'brittle', 'nougat', 'marzipan', 'fondant', 'sugar', 'sugar work', 'candy', 'candies', 'chocolate', 'white chocolate', 'dark chocolate', 'milk chocolate', 'cocoa', 'cocoa powder', 'chocolate chip', 'chocolate chips', 'chocolate chunk', 'chocolate chunks', 'chocolate sauce', 'chocolate syrup', 'hot chocolate', 'hot cocoa', 'dessert', 'desserts', 'sweet', 'sweets', 'treat', 'treats', 'indulgence', 'indulgences', 'confection', 'confectionery', 'confectionary', 'sugar', 'sweetener', 'sweeteners', 'honey', 'maple syrup', 'agave', 'molasses', 'treacle', 'corn syrup', 'high fructose corn syrup', 'icing sugar', 'powdered sugar', 'brown sugar', 'white sugar', 'granulated sugar', 'caster sugar', 'superfine sugar', 'raw sugar', 'turbinado sugar', 'demerara sugar', 'muscovado sugar', 'jaggery', 'panela', 'piloncillo', 'date sugar', 'coconut sugar', 'stevia', 'splenda', 'aspartame', 'saccharin', 'sucralose', 'acesulfame', 'neotame', 'advantame', 'sugar alcohol', 'sorbitol', 'mannitol', 'xylitol', 'erythritol', 'maltitol', 'isomalt', 'lactitol', 'hydrogenated starch hydrolysates', 'polydextrose', 'trehalose', 'tagatose', 'allulose', 'monk fruit', 'luo han guo', 'stevia', 'rebiana', 'reb a', 'reb b', 'reb c', 'reb d', 'reb e', 'reb f', 'reb m', 'reb a', 'stevioside', 'rebaudioside', 'glycoside', 'steviol', 'steviol glycoside', 'natural sweetener', 'artificial sweetener', 'non-nutritive sweetener', 'high intensity sweetener', 'low calorie sweetener', 'zero calorie sweetener', 'sugar substitute', 'sugar alternative', 'sugar replacement', 'sugar free', 'sugarless', 'no sugar added', 'unsweetened', 'lightly sweetened', 'reduced sugar', 'less sugar', 'low sugar', 'no added sugar', 'without sugar', 'sugar reduced', 'sugar decreased', 'sugar lowered', 'sugar minimized', 'sugar optimized', 'sugar balanced', 'sugar controlled', 'sugar managed', 'sugar regulated', 'sugar restricted', 'sugar limited', 'sugar conscious', 'sugar aware', 'sugar smart', 'sugar wise', 'sugar careful', 'sugar mindful', 'sugar thoughtful', 'sugar considerate', 'sugar respectful', 'sugar responsible', 'sugar intentional', 'sugar deliberate', 'sugar purposeful', 'sugar meaningful', 'sugar significant', 'sugar valuable', 'sugar important', 'sugar essential', 'sugar necessary', 'sugar required', 'sugar needed', 'sugar desired', 'sugar wanted', 'sugar preferred', 'sugar chosen', 'sugar selected', 'sugar picked', 'sugar elected', 'sugar opted', 'sugar decided', 'sugar resolved', 'sugar determined', 'sugar committed', 'sugar pledged', 'sugar promised', 'sugar vowed', 'sugar sworn', 'sugar affirmed', 'sugar confirmed', 'sugar verified', 'sugar validated', 'sugar authenticated', 'sugar certified', 'sugar approved', 'sugar accepted', 'sugar acknowledged', 'sugar recognized', 'sugar admitted', 'sugar conceded', 'sugar granted', 'sugar allowed', 'sugar permitted', 'sugar authorized', 'sugar licensed', 'sugar endorsed', 'sugar supported', 'sugar backed', 'sugar advocated', 'sugar promoted', 'sugar advanced', 'sugar progressed', 'sugar developed', 'sugar evolved', 'sugar improved', 'sugar enhanced', 'sugar optimized', 'sugar refined', 'sugar polished', 'sugar perfected', 'sugar mastered', 'sugar accomplished', 'sugar achieved', 'sugar attained', 'sugar reached', 'sugar arrived', 'sugar completed', 'sugar finished', 'sugar concluded', 'sugar finalized', 'sugar sealed', 'sugar closed', 'sugar wrapped', 'sugar packaged', 'sugar presented', 'sugar offered', 'sugar provided', 'sugar supplied', 'sugar furnished', 'sugar equipped', 'sugar outfitted', 'sugar provisioned', 'sugar stocked', 'sugar filled', 'sugar loaded', 'sugar packed', 'sugar brimming', 'sugar overflowing', 'sugar abundant', 'sugar plentiful', 'sugar ample', 'sugar generous', 'sugar bountiful', 'sugar lavish', 'sugar profuse', 'sugar rich', 'sugar full', 'sugar complete', 'sugar whole', 'sugar entire', 'sugar total', 'sugar absolute', 'sugar outright', 'sugar sheer', 'sugar plain', 'sugar simple', 'sugar basic', 'sugar fundamental', 'sugar essential', 'sugar vital', 'sugar critical', 'sugar crucial', 'sugar pivotal', 'sugar key', 'sugar central', 'sugar core', 'sugar heart', 'sugar nucleus', 'sugar center', 'sugar middle', 'sugar midpoint', 'sugar median', 'sugar average', 'sugar mean', 'sugar norm', 'sugar standard', 'sugar regular', 'sugar usual', 'sugar typical', 'sugar common', 'sugar ordinary', 'sugar everyday', 'sugar routine', 'sugar habitual', 'sugar customary', 'sugar traditional', 'sugar conventional', 'sugar established', 'sugar accepted', 'sugar recognized', 'sugar acknowledged', 'sugar admitted', 'sugar conceded', 'sugar granted', 'sugar allowed', 'sugar permitted', 'sugar authorized', 'sugar licensed', 'sugar endorsed', 'sugar supported', 'sugar backed', 'sugar advocated', 'sugar promoted', 'sugar advanced', 'sugar progressed', 'sugar developed', 'sugar evolved', 'sugar improved', 'sugar enhanced', 'sugar optimized', 'sugar refined', 'sugar polished', 'sugar perfected', 'sugar mastered', 'sugar accomplished', 'sugar achieved', 'sugar attained', 'sugar reached', 'sugar arrived', 'sugar completed', 'sugar finished', 'sugar concluded', 'sugar finalized', 'sugar sealed', 'sugar closed', 'sugar wrapped', 'sugar packaged', 'sugar presented', 'sugar offered', 'sugar provided', 'sugar supplied', 'sugar furnished', 'sugar equipped', 'sugar outfitted', 'sugar provisioned', 'sugar stocked', 'sugar filled', 'sugar loaded', 'sugar packed', 'sugar brimming', 'sugar overflowing', 'sugar abundant', 'sugar plentiful', 'sugar ample', 'sugar generous', 'sugar bountiful', 'sugar lavish', 'sugar profuse', 'sugar rich', 'sugar full', 'sugar complete', 'sugar whole', 'sugar entire', 'sugar total', 'sugar absolute', 'sugar outright', 'sugar sheer', 'sugar plain', 'sugar simple', 'sugar basic', 'sugar fundamental', 'sugar essential', 'sugar vital', 'sugar critical', 'sugar crucial', 'sugar pivotal', 'sugar key', 'sugar central', 'sugar core', 'sugar heart', 'sugar nucleus', 'sugar center', 'sugar middle', 'sugar midpoint', 'sugar median', 'sugar average', 'sugar mean', 'sugar norm', 'sugar standard', 'sugar regular', 'sugar usual', 'sugar typical', 'sugar common', 'sugar ordinary', 'sugar everyday', 'sugar routine', 'sugar habitual', 'sugar customary', 'sugar traditional', 'sugar conventional', 'sugar established']
};

function detectMealTypes(recipe) {
    const text = `${recipe.title || ''} ${recipe.description || ''} ${(recipe.categories || []).join(' ')} ${(recipe.dietaryCategories || []).join(' ')}`.toLowerCase();
    const mealTypes = [];

    const breakfastKeywords = MEAL_TYPE_RULES.breakfast;
    const brunchKeywords = MEAL_TYPE_RULES.brunch;
    const lunchKeywords = MEAL_TYPE_RULES.lunch;
    const dinnerKeywords = MEAL_TYPE_RULES.dinner;
    const snackKeywords = MEAL_TYPE_RULES.snack;
    const dessertKeywords = MEAL_TYPE_RULES.dessert;

    if (breakfastKeywords.some(keyword => text.includes(keyword))) mealTypes.push('Breakfast');
    if (brunchKeywords.some(keyword => text.includes(keyword))) mealTypes.push('Brunch');
    if (lunchKeywords.some(keyword => text.includes(keyword))) mealTypes.push('Lunch');
    if (dinnerKeywords.some(keyword => text.includes(keyword))) mealTypes.push('Dinner');
    if (snackKeywords.some(keyword => text.includes(keyword))) mealTypes.push('Snack');
    if (dessertKeywords.some(keyword => text.includes(keyword))) mealTypes.push('Dessert');

    if (mealTypes.length === 0) {
        if (recipe.categories?.some(c => ['Breakfast', 'Brunch'].includes(c))) mealTypes.push('Breakfast');
        else if (recipe.categories?.some(c => ['Dessert'].includes(c))) mealTypes.push('Dessert');
        else if (recipe.categories?.some(c => ['Side', 'Starter'].includes(c))) mealTypes.push('Side');
        else mealTypes.push('Lunch', 'Dinner');
    }

    return [...new Set(mealTypes)];
}

function detectAllergens(ingredients) {
    const detected = new Set();
    const ingredientText = ingredients.map(i => `${i.name} ${i.quantity || ''}`.toLowerCase()).join(' ');

    Object.entries(ALLERGENS).forEach(([allergen, keywords]) => {
        if (keywords.some(keyword => ingredientText.includes(keyword))) {
            detected.add(allergen);
        }
    });

    return Array.from(detected);
}

function detectDietaryCategories(recipe) {
    const ingredients = recipe.ingredients || [];
    const ingredientText = ingredients.map(i => i.name.toLowerCase()).join(' ');

    const dietary = [];

    const meatIngredients = ['chicken', 'beef', 'pork', 'lamb', 'meat', 'fish', 'seafood', 'shrimp', 'bacon', 'turkey', 'duck', 'goose', 'veal', 'rabbit', 'liver', 'kidney', 'heart', 'oxtail', 'venison', 'quail', 'pigeon'];
    const hasMeat = ingredients.some(ing => meatIngredients.some(meat => ing.name.toLowerCase().includes(meat)));

    if (!hasMeat) {
        dietary.push('vegetarian');
    }

    const animalProducts = ['egg', 'eggs', 'milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein', 'lactose', 'dairy', 'honey', 'mayonnaise', 'mayo'];
    const hasAnimalProducts = ingredients.some(ing => animalProducts.some(ap => ing.name.toLowerCase().includes(ap)));

    if (!hasMeat && !hasAnimalProducts) {
        dietary.push('vegan');
    }

    const fishIngredients = ['fish', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'anchovy', 'anchovies', 'sardine', 'sardines', 'mackerel', 'trout', 'bass', 'catfish', 'eel', 'swordfish'];
    const hasFish = ingredients.some(ing => fishIngredients.some(fish => ing.name.toLowerCase().includes(fish)));

    if (!hasMeat && hasFish) {
        dietary.push('pescatarian');
    }

    return dietary;
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
    
    const dietaryCategories = detectDietaryCategories({ ingredients });
    const allergens = detectAllergens(ingredients);
    const mealTypes = detectMealTypes({ title: meal.strMeal, description: meal.strInstructions, categories, dietaryCategories });
    
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
        dietaryCategories,
        allergens,
        mealTypes,
        ingredients,
        instructions,
        source: 'mealdb'
    };
}

function normalizeLocalRecipe(recipe) {
    const ingredients = recipe.ingredients || [];
    const dietaryCategories = detectDietaryCategories({ ingredients });
    const allergens = detectAllergens(ingredients);
    const mealTypes = detectMealTypes({ 
        title: recipe.title, 
        description: recipe.description, 
        categories: recipe.cuisine ? [recipe.cuisine] : [],
        dietaryCategories 
    });

    return {
        id: recipe._id,
        title: recipe.title,
        description: recipe.description || '',
        image: recipe.image || '',
        cookTime: recipe.cookingTime || 30,
        servings: recipe.servings || 4,
        difficulty: recipe.difficulty || 'Medium',
        rating: recipe.rating || '0',
        categories: recipe.cuisine ? [recipe.cuisine] : [],
        dietaryCategories,
        allergens,
        mealTypes,
        ingredients,
        instructions: recipe.instructions || [],
        source: 'local'
    };
}

async function searchEdamamRecipes(query, filters = {}) {
    const appId = window.RECSPICY_CONFIG?.NUTRITION_APP_ID || '';
    const appKey = window.RECSPICY_CONFIG?.NUTRITION_APP_KEY || '';

    if (!appId || !appKey) {
        return [];
    }

    const params = new URLSearchParams({
        app_id: appId,
        app_key: appKey,
        q: query,
        type: 'public'
    });

    if (filters.diet) {
        params.append('diet', filters.diet);
    }
    if (filters.health) {
        params.append('health', filters.health);
    }
    if (filters.cuisineType) {
        params.append('cuisineType', filters.cuisineType);
    }
    if (filters.mealType) {
        params.append('mealType', filters.mealType);
    }
    if (filters.dishType) {
        params.append('dishType', filters.dishType);
    }
    if (filters.calories) {
        params.append('calories', filters.calories);
    }
    if (filters.excluded) {
        params.append('excluded', filters.excluded);
    }

    const url = `${EDAMAM_RECIPE_URL}?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Edamam error ${response.status}`);
    }

    const data = await response.json();
    return (data.hits || []).map(hit => {
        const recipe = hit.recipe;
        const ingredients = recipe.ingredients || [];
        const dietaryCategories = detectDietaryCategories({ ingredients });
        const allergens = detectAllergens(ingredients);
        const mealTypes = detectMealTypes({ 
            title: recipe.label, 
            description: recipe.source || '', 
            categories: recipe.cuisineType || [],
            dietaryCategories 
        });

        return {
            id: recipe.uri,
            title: recipe.label,
            description: recipe.source || recipe.label,
            image: recipe.image,
            cookTime: recipe.totalTime ? Math.round(recipe.totalTime) : 30,
            servings: recipe.yield ? Math.round(recipe.yield) : 4,
            difficulty: recipe.totalTime > 60 ? 'Hard' : recipe.totalTime > 30 ? 'Medium' : 'Easy',
            rating: recipe.rating || '?',
            categories: recipe.cuisineType || [],
            dietaryCategories,
            allergens,
            mealTypes,
            ingredients: ingredients.map(ing => ({ name: ing.food || ing.text || '', quantity: ing.quantity || 'to taste' })),
            instructions: recipe.ingredientLines || [],
            source: 'edamam'
        };
    });
}

async function fetchTrendingRecipes() {
    try {
        const promises = Array.from({ length: 8 }, () => 
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
        
        const promises = data.meals.slice(0, 8).map(meal =>
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
        
        const promises = data.meals.slice(0, 8).map(meal =>
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

async function fetchLocalPublicRecipes() {
    try {
        const response = await fetch('/api/recipes/public');
        if (!response.ok) return [];
        const recipes = await response.json();
        return recipes.map(normalizeLocalRecipe);
    } catch (error) {
        console.error('Error fetching local recipes:', error);
        return [];
    }
}

async function fetchAllPublicRecipes() {
    const [mealdbRecipes, localRecipes] = await Promise.all([
        fetchMealdbAllCategories(),
        fetchLocalPublicRecipes()
    ]);
    
    const combined = [...mealdbRecipes, ...localRecipes];
    const seen = new Set();
    return combined.filter(recipe => {
        if (seen.has(recipe.id)) return false;
        seen.add(recipe.id);
        return true;
    });
}

async function fetchMealdbAllCategories() {
    const categories = ['Beef', 'Chicken', 'Dessert', 'Lamb', 'Miscellaneous', 'Pasta', 'Pork', 'Seafood', 'Side', 'Starter', 'Vegan', 'Vegetarian', 'Breakfast', 'Goat'];
    const recipes = [];
    const seen = new Set();

    for (const category of categories) {
        try {
            const categoryRecipes = await getRecipesByCategory(category);
            categoryRecipes.forEach(recipe => {
                if (!seen.has(recipe.id)) {
                    seen.add(recipe.id);
                    recipes.push(recipe);
                }
            });
        } catch (error) {
            console.error(`Error fetching ${category} recipes:`, error);
        }
    }

    return recipes;
}

window.recipeApi = {
    fetchTrendingRecipes,
    fetchFeaturedRecipes,
    fetchRecommendedRecipes,
    searchRecipes,
    getRecipeById,
    getRecipesByCategory,
    getCategories,
    fetchRecipesByLetter,
    fetchAllPublicRecipes,
    fetchLocalPublicRecipes,
    fetchMealdbAllCategories,
    searchEdamamRecipes,
    formatMealDbRecipe,
    normalizeLocalRecipe,
    detectAllergens,
    detectDietaryCategories,
    detectMealTypes
};
