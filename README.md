# Recspicy

Recipe management platform with user authentication, meal planning, and recipe creation.

## Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in values
4. Start MongoDB
5. Run `npm run dev` for development or `npm start` for production

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `CLIENT_ORIGIN` | Frontend origin for CORS |

## Project Structure

```
.
├── controllers/     # Route controllers
├── middleware/      # Auth and error middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── public/         # Frontend static files
│   ├── css/
│   ├── js/
│   └── images/
├── server.js       # App entry point
├── db.js           # MongoDB connection
├── auth.js         # JWT utilities
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `POST /api/users/google-auth` - Google authentication
- `POST /api/users/google-signup` - Google signup

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile
- `POST /api/users/:userId/avatar` - Upload avatar
- `GET /api/users/:userId/avatar` - Get avatar
- `GET /api/users/count/total` - Total user count

### Recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/user/:userId` - Get user's recipes
- `GET /api/recipes/public` - Get public recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `GET /api/recipes/count/total` - Total recipe count

### Meal Plans
- `POST /api/meal-plans` - Create meal plan
- `GET /api/meal-plans/user/:userId` - Get user's meal plans
- `GET /api/meal-plans/:id` - Get meal plan by ID
- `PUT /api/meal-plans/:id` - Update meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan

### Favorites
- `POST /api/users/:userId/favorites` - Toggle favorite
- `POST /api/recipe-records/:recipeId/rate` - Toggle rating
- `POST /api/recipe-records/:recipeId/favorite` - Toggle favorite
- `GET /api/recipe-records/:recipeId/user/:userId/status` - Check user status

## Frontend

The frontend is served as static files from the `public/` directory. Key pages:

- `/` - Landing page
- `/index.html` - Home page with recipe discovery
- `/signin.html` - User login
- `/signup.html` - User registration
- `/profile.html` - User profile and recipe management
- `/meal-planner.html` - Meal plan creation
- `/recipes-list.html` - Browse recipes
- `/admin.html` - Admin dashboard

## License

ISC
