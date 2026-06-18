#!/bin/bash

# MovieNight - Quick Deploy to Dev
# This script builds and deploys to the dev environment

set -e

echo "🍿 MovieNight - Deploy to Dev"
echo "=============================="

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY="int-production-use1-ecs"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
NAMESPACE="movienight-dev"

# Check prerequisites
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required"; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "❌ Helm required"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl required"; exit 1; }

# Get TMDB API Key
if [ -z "$TMDB_API_KEY" ]; then
  read -p "Enter TMDB API Key: " TMDB_API_KEY
fi

# Step 1: Login to ECR
echo ""
echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Step 2: Build and push backend
echo ""
echo "🔨 Building backend..."
cd backend
docker build -t ${ECR_REGISTRY}/${ECR_REPOSITORY}:movienight-backend-dev-latest .
echo "⬆️  Pushing backend..."
docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:movienight-backend-dev-latest
cd ..

# Step 3: Build and push frontend
echo ""
echo "🔨 Building frontend..."
cd frontend
docker build -t ${ECR_REGISTRY}/${ECR_REPOSITORY}:movienight-frontend-dev-latest .
echo "⬆️  Pushing frontend..."
docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:movienight-frontend-dev-latest
cd ..

# Step 4: Deploy with Helm
echo ""
echo "🚀 Deploying to dev with Helm..."
helm upgrade --install movienight ./helm/movienight \
  --namespace ${NAMESPACE} \
  --create-namespace \
  --values ./helm/movienight/values-dev.yaml \
  --set backend.image.tag=movienight-backend-dev-latest \
  --set frontend.image.tag=movienight-frontend-dev-latest \
  --set secrets.tmdbApiKey=${TMDB_API_KEY} \
  --wait \
  --timeout 10m

# Step 5: Get status
echo ""
echo "📊 Deployment Status:"
kubectl get pods -n ${NAMESPACE}

# Step 6: Get URL
echo ""
ALB_URL=$(kubectl get ingress movienight-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "pending")

if [ "$ALB_URL" != "pending" ] && [ -n "$ALB_URL" ]; then
  echo "✅ Dev deployment complete!"
  echo "🔗 Access: http://${ALB_URL}"
else
  echo "⏳ ALB provisioning... Check later with:"
  echo "   kubectl get ingress -n ${NAMESPACE}"
fi

echo ""
echo "📝 Useful commands:"
echo "   kubectl logs -f deployment/movienight-backend -n ${NAMESPACE}"
echo "   kubectl get pods -n ${NAMESPACE}"
echo "   helm list -n ${NAMESPACE}"
