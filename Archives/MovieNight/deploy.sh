#!/bin/bash

# MovieNight Deployment Script for AWS EKS
# This script automates the deployment of MovieNight to AWS EKS

set -e

echo "🍿 MovieNight EKS Deployment Script"
echo "===================================="

# Check prerequisites
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI is required but not installed. Aborting."; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl is required but not installed. Aborting."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting."; exit 1; }

# Configuration
read -p "Enter AWS Account ID: " AWS_ACCOUNT_ID
read -p "Enter AWS Region [us-east-1]: " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}
read -p "Enter TMDB API Key: " TMDB_API_KEY
read -p "Enter your domain [movienight.example.com]: " DOMAIN
DOMAIN=${DOMAIN:-movienight.example.com}

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo ""
echo "📋 Configuration:"
echo "  AWS Account: ${AWS_ACCOUNT_ID}"
echo "  AWS Region: ${AWS_REGION}"
echo "  ECR Registry: ${ECR_REGISTRY}"
echo "  Domain: ${DOMAIN}"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

# Step 1: Login to ECR
echo ""
echo "🔐 Step 1: Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Step 2: Create ECR repositories
echo ""
echo "📦 Step 2: Creating ECR repositories..."
aws ecr create-repository --repository-name movienight-backend --region ${AWS_REGION} 2>/dev/null || echo "  Repository movienight-backend already exists"
aws ecr create-repository --repository-name movienight-frontend --region ${AWS_REGION} 2>/dev/null || echo "  Repository movienight-frontend already exists"

# Step 3: Build and push backend
echo ""
echo "🔨 Step 3: Building and pushing backend..."
cd backend
docker build -t ${ECR_REGISTRY}/movienight-backend:latest .
docker push ${ECR_REGISTRY}/movienight-backend:latest
cd ..

# Step 4: Build and push frontend
echo ""
echo "🔨 Step 4: Building and pushing frontend..."
cd frontend
docker build -t ${ECR_REGISTRY}/movienight-frontend:latest .
docker push ${ECR_REGISTRY}/movienight-frontend:latest
cd ..

# Step 5: Update Kubernetes manifests
echo ""
echo "📝 Step 5: Updating Kubernetes manifests..."
sed -i.bak "s|YOUR_ECR_REPO|${ECR_REGISTRY}|g" k8s/backend-deployment.yaml
sed -i.bak "s|YOUR_ECR_REPO|${ECR_REGISTRY}|g" k8s/frontend-deployment.yaml
sed -i.bak "s|movienight.example.com|${DOMAIN}|g" k8s/ingress.yaml
rm k8s/*.bak

# Step 6: Create namespace
echo ""
echo "🏗️  Step 6: Creating Kubernetes namespace..."
kubectl apply -f k8s/namespace.yaml

# Step 7: Create secrets
echo ""
echo "🔐 Step 7: Creating Kubernetes secrets..."
kubectl create secret generic movienight-secrets \
  --from-literal=tmdb-api-key=${TMDB_API_KEY} \
  -n movienight --dry-run=client -o yaml | kubectl apply -f -

# Step 8: Apply configurations
echo ""
echo "⚙️  Step 8: Applying configurations..."
kubectl apply -f k8s/configmap.yaml

# Step 9: Deploy backend
echo ""
echo "🚀 Step 9: Deploying backend..."
kubectl apply -f k8s/backend-deployment.yaml

# Step 10: Deploy frontend
echo ""
echo "🚀 Step 10: Deploying frontend..."
kubectl apply -f k8s/frontend-deployment.yaml

# Step 11: Create ingress
echo ""
echo "🌐 Step 11: Creating ingress..."
kubectl apply -f k8s/ingress.yaml

# Step 12: Apply HPA
echo ""
echo "📊 Step 12: Applying horizontal pod autoscaling..."
kubectl apply -f k8s/hpa.yaml

# Wait for deployment
echo ""
echo "⏳ Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/movienight-backend -n movienight
kubectl wait --for=condition=available --timeout=300s deployment/movienight-frontend -n movienight

# Get ALB URL
echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 Deployment Status:"
kubectl get all -n movienight

echo ""
echo "🌐 Getting Load Balancer URL..."
sleep 10  # Wait for ALB to be provisioned

ALB_URL=$(kubectl get ingress movienight-ingress -n movienight -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "pending")

if [ "$ALB_URL" != "pending" ] && [ -n "$ALB_URL" ]; then
    echo ""
    echo "✅ MovieNight is deployed!"
    echo "🔗 Access your app at: http://${ALB_URL}"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Point your domain '${DOMAIN}' to: ${ALB_URL}"
    echo "  2. Configure SSL certificate in k8s/ingress.yaml (optional)"
    echo "  3. Monitor: kubectl get all -n movienight"
else
    echo ""
    echo "⏳ ALB is being provisioned. This may take a few minutes."
    echo "   Check status with: kubectl get ingress -n movienight"
fi

echo ""
echo "🍿 Happy movie watching!"
