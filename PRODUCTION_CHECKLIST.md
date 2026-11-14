# Production Setup Checklist

## InfinityFree (Frontend)
- [ ] Upload `infinitydeploy/*` to `recspicy.ct.ws/htdocs/`
- [ ] Ensure `index.html` is in root
- [ ] Test: `https://recspicy.ct.ws`
- [ ] Verify all static assets load
- [ ] Check CORS headers in browser dev tools

## Render (Backend API)
- [ ] Push code to GitHub
- [ ] Create new web service on Render
- [ ] Add all environment variables from `.env.production.example`
- [ ] Set up MongoDB Atlas connection string
- [ ] Configure CORS to allow `https://recspicy.ct.ws`
- [ ] Test API: `https://recspicy-api.onrender.com/api/users/count/total`

## MongoDB Atlas
- [ ] Create cluster and database
- [ ] Set up user `jimmymcguigan18_db_user`
- [ ] Whitelist Render's IP (0.0.0.0/0 for testing)
- [ ] Verify connection works

## Final Tests
- [ ] Full user registration → login → data retrieval
- [ ] Recipe creation and management
- [ ] Meal planning functionality
- [ ] Nutrition API integration
- [ ] Google OAuth flow
- [ ] Email verification (if implemented)

## Monitoring
- [ ] Set up Render notifications
- [ ] Monitor MongoDB Atlas usage
- [ ] Check InfinityFree uptime
