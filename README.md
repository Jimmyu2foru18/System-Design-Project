# Recspicy

Recipe management platform with user authentication, meal planning, nutrition analysis, and external recipe integrations.

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Authentication**: JWT, Google OAuth 2.0
- **Integrations**: TheMealDB, Edamam Nutrition API, Open Brewery DB, Report of the Week, Open Food Facts

## Prerequisites

- Node.js 18+
- MongoDB 6+ (optional — app serves static files and external APIs without it)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in values
4. Start MongoDB (optional)
5. Run `npm start` or `node server.js`

The server starts on `http://localhost:5000` and serves the frontend even without MongoDB. Database-dependent endpoints return empty results when MongoDB is unavailable.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NUTRITION_APP_ID` | Edamam Nutrition API app ID |
| `NUTRITION_APP_KEY` | Edamam Nutrition API app key |
| `CLIENT_ORIGIN` | Frontend origin for CORS |

## Project Structure

```
.
├── controllers/         # Route controllers
│   ├── mealPlanController.js
│   ├── recipeController.js
│   ├── recipeRecordController.js
│   └── userController.js
├── middleware/          # Auth and error middleware
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/             # Mongoose models
│   ├── MealPlan.js
│   ├── Recipe.js
│   ├── RecipeRecord.js
│   └── User.js
├── routes/             # API routes
│   ├── userRoutes.js
│   └── recipeRecordRoutes.js
├── public/             # Frontend static files
│   ├── css/
│   ├── js/
│   └── images/
├── server.js           # App entry point
├── db.js               # MongoDB connection with fallback
├── auth.js             # JWT utilities
└── package.json
```

## Design System

The frontend uses a unified CSS design system defined in `public/css/styles.css` with CSS custom properties for consistent colors, typography, spacing, and components.

### Color Palette

- Primary: `#b40000` (red)
- Secondary: `#1a365d` (navy)
- Background: `#f8fafc`
- Surface: `#ffffff`
- Text: `#1e293b`
- Border: `#e2e8f0`

### Button Variants

- `.btn-primary` - Primary CTA
- `.btn-secondary` - Secondary action
- `.btn-outline` - Outlined button
- `.btn-success` - Success action
- `.btn-danger` - Destructive action
- `.btn-google` - Google sign-in

## API Endpoints

### Authentication
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `POST /api/users/google-auth` - Google authentication
- `POST /api/users/google-signup` - Google signup

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/profile` - Update profile with avatar
- `GET /api/users/count/total` - Total user count

### Recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/user/:userId` - Get user's recipes
- `GET /api/recipes/public` - Get public recipes
- `GET /api/recipes/:id` - Get recipe by ID (local or TheMealDB fallback)
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `GET /api/recipes/count/total` - Total recipe count

### Recipe Records
- `POST /api/recipe-records/:recipeId/rate` - Toggle rating
- `POST /api/recipe-records/:recipeId/favorite` - Toggle favorite
- `GET /api/recipe-records/:recipeId/user/:userId/status` - Check user status

### Meal Plans
- `POST /api/meal-plans` - Create meal plan
- `GET /api/meal-plans/user/:userId` - Get user's meal plans
- `GET /api/meal-plans/:id` - Get meal plan by ID
- `PUT /api/meal-plans/:id` - Update meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan

### Nutrition
- `POST /api/nutrition` - Analyze recipe nutrition via Edamam

## Frontend Pages

- `/index.html` - Landing page
- `/home.html` - Home dashboard with search and filters
- `/signin.html` - User login
- `/signup.html` - User registration
- `/profile.html` - User profile and recipe management
- `/meal-planner.html` - Weekly meal planner
- `/recipes-list.html` - Browse recipes with meal type, dietary, and allergy filters
- `/recipes.html` - Individual recipe view with nutrition and print
- `/breweries.html` - Browse breweries via Open Brewery DB
- `/reports.html` - Browse reports via Report of the Week
- `/openfoodfacts.html` - Search food products via Open Food Facts
- `/admin.html` - Admin dashboard
- `/about.html` - About page
- `/contact.html` - Contact page
- `/faq.html` - Frequently asked questions
- `/terms-privacy.html` - Terms and privacy policy
- `/create-recipe.html` - Create new recipe

## License

ISC
