# 🚀 Quick Start - GitHub Actions Deployment

## ✅ Checklist

### Prerequisites
- [ ] AWS EKS cluster is running
- [ ] ECR repository `int-production-use1-ecs` exists
- [ ] TMDB API key obtained
- [ ] kubectl configured for your EKS cluster

### Setup (One-time)

#### 1. Create IAM User for GitHub Actions
```bash
# Create user
aws iam create-user --user-name github-actions-movienight

# Create and attach policy (see DEPLOYMENT_GUIDE.md for full policy)
aws iam create-policy --policy-name GitHubActionsMovieNightPolicy --policy-document file://github-actions-policy.json

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws iam attach-user-policy \
  --user-name github-actions-movienight \
  --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/GitHubActionsMovieNightPolicy

# Create access key
aws iam create-access-key --user-name github-actions-movienight
```
**Save the Access Key ID and Secret Access Key!**

#### 2. Grant EKS Access to IAM User
```bash
# Edit aws-auth ConfigMap
kubectl edit configmap aws-auth -n kube-system

# Add this under mapUsers:
# - userarn: arn:aws:iam::YOUR_ACCOUNT_ID:user/github-actions-movienight
#   username: github-actions-movienight
#   groups:
#     - system:masters
```

#### 3. Add GitHub Secrets
Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these secrets:
- `AWS_ACCESS_KEY_ID` - From step 1
- `AWS_SECRET_ACCESS_KEY` - From step 1
- `TMDB_API_KEY` - Your TMDB API key

#### 4. Update GitHub Actions Workflow
Edit `.github/workflows/deploy-movienight.yml`:

```yaml
env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: int-production-use1-ecs  # ✅ Already set
  EKS_CLUSTER_NAME: YOUR_EKS_CLUSTER_NAME  # ⚠️ UPDATE THIS
  K8S_NAMESPACE: movienight
```

Replace `YOUR_EKS_CLUSTER_NAME` with your actual cluster name:
```bash
aws eks list-clusters --region us-east-1
```

#### 5. Update K8s Manifests
Edit `MovieNight/k8s/backend-deployment.yaml` and `frontend-deployment.yaml`:

Replace `YOUR_ACCOUNT_ID` with your AWS Account ID:
```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

sed -i "s|YOUR_ACCOUNT_ID|${AWS_ACCOUNT_ID}|g" MovieNight/k8s/backend-deployment.yaml
sed -i "s|YOUR_ACCOUNT_ID|${AWS_ACCOUNT_ID}|g" MovieNight/k8s/frontend-deployment.yaml
```

### Deploy!

#### Option A: GitHub Actions (Recommended)
```bash
git add .
git commit -m "feat: Add MovieNight with GitHub Actions deployment"
git push origin main
```

Go to **GitHub → Actions** tab to watch the deployment.

#### Option B: Manual Push to ECR
```bash
cd MovieNight
chmod +x push-to-ecr.sh
./push-to-ecr.sh
```

Then deploy manually:
```bash
kubectl create secret generic movienight-secrets \
  --from-literal=tmdb-api-key=YOUR_TMDB_API_KEY \
  -n movienight

kubectl apply -f k8s/
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -n movienight

# Check services
kubectl get svc -n movienight

# Get ALB URL
kubectl get ingress movienight-ingress -n movienight -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Access Your App
```bash
ALB_URL=$(kubectl get ingress movienight-ingress -n movienight -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "🍿 MovieNight: http://${ALB_URL}"
```

## 📚 Full Documentation

- **Detailed Setup**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **App Features**: See [README.md](README.md)
- **Troubleshooting**: Check GitHub Actions logs or pod logs

## 🎯 Architecture

```
GitHub Push → GitHub Actions
    ↓
Build Images → Push to ECR (int-production-use1-ecs)
    ↓
Deploy to EKS → Rolling Update
    ↓
ALB → Frontend → Backend → TMDB API
```

## 🔄 Future Deployments

Every push to `main` automatically:
1. Builds new Docker images
2. Pushes to ECR with commit SHA tags
3. Deploys to EKS with rolling update
4. Verifies deployment health

## 🐛 Quick Troubleshooting

**Unauthorized error in GitHub Actions:**
```bash
# Verify IAM user has EKS access
kubectl get configmap aws-auth -n kube-system -o yaml
```

**Images not pushing to ECR:**
```bash
# Verify ECR permissions
aws ecr describe-repositories --repository-name int-production-use1-ecs
```

**Pods not starting:**
```bash
# Check logs
kubectl logs -f deployment/movienight-backend -n movienight

# Check events
kubectl get events -n movienight --sort-by='.lastTimestamp'
```

## ✅ Success!

Once deployed, you'll see:
- ✅ Green checkmark in GitHub Actions
- ✅ Pods running in EKS
- ✅ ALB URL accessible
- ✅ MovieNight app working! 🍿
