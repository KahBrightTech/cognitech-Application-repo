#!/bin/bash

# Manual ECR Push Script for MovieNight
# Use this to manually build and push images to ECR before setting up GitHub Actions

set -e

echo "🍿 MovieNight - Manual ECR Push"
echo "================================"

# Configuration
read -p "Enter your AWS Account ID: " AWS_ACCOUNT_ID
read -p "Enter AWS Region [us-east-1]: " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REPOSITORY="int-production-use1-ecs"

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo ""
echo "📋 Configuration:"
echo "  AWS Account: ${AWS_ACCOUNT_ID}"
echo "  AWS Region: ${AWS_REGION}"
echo "  ECR Repository: ${ECR_REPOSITORY}"
echo "  ECR Registry: ${ECR_REGISTRY}"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled."
    exit 1
fi

# Step 1: Login to ECR
echo ""
echo "🔐 Step 1: Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Step 2: Build backend
echo ""
echo "🔨 Step 2: Building backend image..."
cd backend
docker build -t ${ECR_REGISTRY}/${ECR_REPOSITORY}:movienight-backend-latest .
cd ..

# Step 3: Build frontend
echo ""
echo "🔨 Step 3: Building frontend image..."
cd frontend
docker build -t ${ECR_REGISTRY}/${ECR_REPOSITORY}:movienight-frontend-latest .
cd ..

# Step 4: Push backend
echo ""
echo "⬆️  Step 4: Pushing backend image to ECR..."
docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:movienight-backend-latest

# Step 5: Push frontend
echo ""
echo "⬆️  Step 5: Pushing frontend image to ECR..."
docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:movienight-frontend-latest

# Step 6: Update K8s manifests
echo ""
echo "📝 Step 6: Updating Kubernetes manifests..."
sed -i.bak "s|YOUR_ACCOUNT_ID|${AWS_ACCOUNT_ID}|g" k8s/backend-deployment.yaml
sed -i.bak "s|YOUR_ACCOUNT_ID|${AWS_ACCOUNT_ID}|g" k8s/frontend-deployment.yaml
rm k8s/*.bak

echo ""
echo "✅ Images pushed to ECR successfully!"
echo ""
echo "🎯 Next Steps:"
echo "  1. Update K8s manifests with your settings:"
echo "     - k8s/configmap.yaml (domain, etc.)"
echo "     - k8s/ingress.yaml (your domain)"
echo ""
echo "  2. Create Kubernetes secret:"
echo "     kubectl create secret generic movienight-secrets \\"
echo "       --from-literal=tmdb-api-key=YOUR_TMDB_API_KEY \\"
echo "       -n movienight"
echo ""
echo "  3. Deploy to Kubernetes:"
echo "     kubectl apply -f k8s/"
echo ""
echo "  4. Or set up GitHub Actions for automated deployments!"
echo "     See DEPLOYMENT_GUIDE.md"
echo ""
echo "🍿 Happy deploying!"
