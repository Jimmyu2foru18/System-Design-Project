# Production MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Cluster
1. Visit [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Click "Create Cluster" → Choose Free M0 tier
4. Set Cluster Name: "recspicy-cluster"

## Step 2: Configure Database User
1. In Atlas Dashboard → Database Access → Add User
2. Username: `jimmymcguigan18_db_user`
3. Password: `PYfmFIielGHZwsN9`
4. Roles: `readWrite` on database `recspicy`

## Step 3: Whitelist IPs
1. Database Access → Network Access
2. Add IP: `0.0.0.0/0` (for Render access)
3. Or add specific IPs: Render's IP (dynamic)

## Step 4: Create Database & Collection
1. Database → Collections → Create Collection `recspicy`
2. Collection Name: `users`
   - Schema: `{ username, email, password, createdAt }`

## Step 5: Update Environment Variables
Copy `.env.production.example` values to your Render dashboard:
- `MONGO_URI`: `mongodb+srv://jimmymcguigan18_db_user:PYfmFIielGHZwsN9@recspicy-cluster.vruyb33.mongodb.net/recspicy`

## Step 6: Verify Connection
```bash
# Test MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('Atlas connected'), err => console.error('Connection error:', err))"
```

## Security Notes
- Never commit MongoDB credentials to GitHub
- Store passwords in environment variables or secret managers
- Use IP whitelisting instead of `0.0.0.0/0` in production
