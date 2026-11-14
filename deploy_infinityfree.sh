#!/bin/bash
echo "Creating deployment package for InfinityFree..."
echo ""
echo "1. Creating deployment package..."
mkdir -p infinitydeploy
cp -r public/* infinitydeploy/

echo "2. Deploying to InfinityFree..."
echo "Upload these files to: recspicy.ct.ws/htdocs/"
echo "Contents of infinitydeploy/:"
ls -la infinitydeploy/

echo "3. Set up environment variables in Render dashboard:"
echo "   - MONGO_URI"
echo "   - JWT_SECRET" 
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - NUTRITION_APP_ID"
echo "   - NUTRITION_APP_KEY"
echo "   - CLIENT_ORIGIN: https://recspicy.ct.ws"

echo "4. Important URLs to remember:"
echo "   - Frontend: https://recspicy.ct.ws"
echo "   - Backend: https://recspicy-api.onrender.com/api"
echo ""
echo "✅ Deployment preparation complete!"
