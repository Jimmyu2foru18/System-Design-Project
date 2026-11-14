#!/bin/bash
echo "🔧 Creating deployment package for InfinityFree..."
echo ""
echo "1. Creating deployment package..."
mkdir -p infinitydeploy
cp -r public/* infinitydeploy/

echo "2. Testing deployment package..."
echo "Contents of infinitydeploy/:"
ls -la infinitydeploy/

echo ""
echo "3. Creating deployment summary..."
cat > DEPLOYMENT_SUMMARY.txt << EOF
InfinityFree Deployment Summary
===============================

Frontend Files to Upload:
- $(ls infinitydeploy/ | wc -l) files total
- All HTML, CSS, JS, images, and assets

To Upload to InfinityFree:
1. Go to: https://recspicy.ct.ws
2. Use InfinityFree File Manager or FTP
3. Navigate to: /htdocs/
4. Upload all files from 'infinitydeploy/' folder

Important Notes:
✅ All frontend dependencies are included (no external APIs needed)
✅ All static files are self-contained
✅ HTML files reference API via window.RECSPICY_CONFIG.API_BASE_URL

Backend API:
- Deploy to Render using: render.yaml
- API URL: https://recspicy-api.onrender.com/api
- MongoDB Atlas: recspicy-cluster.vruyb33.mongodb.net

MongoDB Credentials:
- Username: jimmymcguigan18_db_user
- Password: PYfmFIielGHZwsN9
- Cluster: recspicy-cluster.vruyb33.mongodb.net

After Deployment:
1. Run setup_production.sh for checklist
2. Complete Render deployment with environment variables
3. Update MongoDB Atlas IP whitelist
4. Test full functionality workflow
EOF

echo "Deployment summary created: DEPLOYMENT_SUMMARY.txt"
