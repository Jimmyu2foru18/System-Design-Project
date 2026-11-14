# Production Verification Script

## MongoDB Atlas Test
```bash
# Test connection to new Atlas cluster
NODE_ENV=production node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://jimmymcguigan18_db_user:PYfmFIielGHZwsN9@recspicy-cluster.vruyb33.mongodb.net/recspicy')
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Atlas connection failed:', err.message);
    process.exit(1);
  });
"
```

## Environment Variables Check
```bash
# Check required variables are set
echo "MONGO_URI: ${MONGO_URI:-'NOT SET'}"
echo "JWT_SECRET: ${JWT_SECRET:-'NOT SET'}"
echo "GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-'NOT SET'}"
echo "GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:-'NOT SET'}"
echo "NUTRITION_APP_ID: ${NUTRITION_APP_ID:-'NOT SET'}"
echo "NUTRITION_APP_KEY: ${NUTRITION_APP_KEY:-'NOT SET'}"
```

## Render Deployment
```bash
# Push to GitHub and deploy to Render using render.yaml
# Environment variables: Set all variables from .env.production.example
# CORS: Configure to allow 'https://recspicy.ct.ws'
```

## InfinityFree Deployment
```bash
# Upload to InfinityFree
# Source: infinitydeploy/ folder contents
# Target: recspicy.ct.ws/htdocs/
# Ensure index.html is in root
```

## Final Testing
```bash
# Test frontend
# Visit: https://recspicy.ct.ws
# Check API calls in browser dev tools

# Test backend
# Test API: https://recspicy-api.onrender.com/api/users/count/total
```
