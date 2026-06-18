# 🚀 MovieNight - GitHub Actions Deployment Guide

Complete step-by-step guide to deploy MovieNight to AWS EKS using GitHub Actions.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ AWS Account with EKS cluster running
- ✅ ECR repository created: `int-production-use1-ecs`
- ✅ GitHub repository with MovieNight code
- ✅ TMDB API Key
- ✅ AWS IAM user with appropriate permissions

---

## 🔐 Step 1: Create AWS IAM User for GitHub Actions

### 1.1 Create IAM User

```bash
aws iam create-user --user-name github-actions-movienight
```

### 1.2 Attach Policies

Create a policy file `github-actions-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "eks:DescribeCluster",
        "eks:ListClusters"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

Apply the policy:

```bash
aws iam create-policy \
  --policy-name GitHubActionsMovieNightPolicy \
  --policy-document file://github-actions-policy.json

# Get your AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Attach policy to user
aws iam attach-user-policy \
  --user-name github-actions-movienight \
  --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/GitHubActionsMovieNightPolicy
```

### 1.3 Create Access Keys

```bash
aws iam create-access-key --user-name github-actions-movienight
```

**Save the output!** You'll need:
- `AccessKeyId`
- `SecretAccessKey`

---

## 🔑 Step 2: Configure EKS Access for IAM User

### 2.1 Update aws-auth ConfigMap

```bash
# Get current aws-auth ConfigMap
kubectl get configmap aws-auth -n kube-system -o yaml > aws-auth.yaml

# Edit aws-auth.yaml and add under mapUsers:
```

Add this to the `mapUsers` section:

```yaml
mapUsers: |
  - userarn: arn:aws:iam::YOUR_ACCOUNT_ID:user/github-actions-movienight
    username: github-actions-movienight
    groups:
      - system:masters
```

Apply the changes:

```bash
kubectl apply -f aws-auth.yaml
```

### 2.2 Verify Access

```bash
# Test with the IAM user credentials
export AWS_ACCESS_KEY_ID=<github-actions-access-key>
export AWS_SECRET_ACCESS_KEY=<github-actions-secret-key>
aws eks update-kubeconfig --name your-eks-cluster-name --region us-east-1
kubectl get nodes
```

---

## 🔒 Step 3: Add GitHub Secrets

Go to your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | IAM user access key from Step 1.3 |
| `AWS_SECRET_ACCESS_KEY` | `xxxxx...` | IAM user secret key from Step 1.3 |
| `TMDB_API_KEY` | `xxxxx...` | Your TMDB API key |

---

## ⚙️ Step 4: Update GitHub Actions Workflow

Update the workflow file `.github/workflows/deploy-movienight.yml`:

### 4.1 Update Environment Variables

```yaml
env:
  AWS_REGION: us-east-1                    # Your AWS region
  ECR_REPOSITORY: int-production-use1-ecs  # ✅ Already set
  EKS_CLUSTER_NAME: my-eks-cluster         # ⚠️ UPDATE THIS
  K8S_NAMESPACE: movienight
```

**Required Changes:**
- [ ] Update `EKS_CLUSTER_NAME` with your actual EKS cluster name
- [ ] Verify `AWS_REGION` matches your setup

### 4.2 Get Your EKS Cluster Name

```bash
aws eks list-clusters --region us-east-1
```

---

## 📝 Step 5: Update Kubernetes Manifests

The workflow will automatically update image tags, but let's verify the ECR repository is correct:

### 5.1 Check Current Manifests

Your manifests should reference the ECR repository like this:

```yaml
# backend-deployment.yaml
image: YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/int-production-use1-ecs:movienight-backend-latest

# frontend-deployment.yaml
image: YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/int-production-use1-ecs:movienight-frontend-latest
```

The GitHub Actions workflow will automatically replace these with the correct image tags during deployment.

---

## 🚀 Step 6: Deploy!

### Option A: Automatic Deployment (Recommended)

Push to the `main` branch:

```bash
cd MovieNight
git add .
git commit -m "feat: Add MovieNight application"
git push origin main
```

The workflow will automatically:
1. ✅ Build Docker images
2. ✅ Push to ECR with tags: `movienight-backend-<commit-sha>` and `movienight-backend-latest`
3. ✅ Deploy to EKS
4. ✅ Wait for rollout to complete

### Option B: Manual Deployment

Go to GitHub: **Actions → Build and Deploy MovieNight to EKS → Run workflow**

---

## 📊 Step 7: Monitor Deployment

### 7.1 Watch GitHub Actions

- Go to **Actions** tab in GitHub
- Click on the running workflow
- Monitor each step in real-time

### 7.2 Check Kubernetes Status

```bash
# Watch pods
kubectl get pods -n movienight -w

# Check deployment status
kubectl get deployments -n movienight

# View logs
kubectl logs -f deployment/movienight-backend -n movienight
kubectl logs -f deployment/movienight-frontend -n movienight

# Check ingress
kubectl get ingress -n movienight

# Get ALB URL
kubectl get ingress movienight-ingress -n movienight -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

---

## 🌐 Step 8: Access Your Application

### 8.1 Get Load Balancer URL

From GitHub Actions output or run:

```bash
ALB_URL=$(kubectl get ingress movienight-ingress -n movienight -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "🍿 MovieNight: http://${ALB_URL}"
```

### 8.2 Test the Application

1. Open `http://<ALB-URL>` in your browser
2. Click "Create Movie Night"
3. Enter your name and create a session
4. Open another browser tab/incognito window
5. Join the session with the code
6. Start swiping! 🎬

---

## 🔄 Step 9: Future Deployments

Every push to `main` that changes files in `MovieNight/` will automatically:

1. **Build new images** with commit SHA tags
2. **Push to ECR** with both SHA and `latest` tags
3. **Deploy to EKS** with zero-downtime rolling update
4. **Wait for rollout** to ensure healthy deployment

### Manual Rollback

If needed, rollback to previous version:

```bash
kubectl rollout undo deployment/movienight-backend -n movienight
kubectl rollout undo deployment/movienight-frontend -n movienight
```

---

## 🎯 Architecture Overview

```
GitHub Push → GitHub Actions
                ↓
        Build Docker Images
                ↓
        Push to ECR (int-production-use1-ecs)
                ↓
        Update K8s Manifests
                ↓
        Deploy to EKS
                ↓
        ALB → Frontend (Nginx)
                ↓
        Frontend → Backend (Node.js + Socket.io)
                ↓
        Backend → TMDB API
```

---

## 🐛 Troubleshooting

### Issue: "error: You must be logged in to the server (Unauthorized)"

**Solution:** IAM user doesn't have EKS access. Re-check Step 2.

```bash
# Verify aws-auth ConfigMap
kubectl get configmap aws-auth -n kube-system -o yaml
```

### Issue: "denied: User not authenticated"

**Solution:** ECR permissions issue.

```bash
# Test ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### Issue: Pods in CrashLoopBackOff

**Solution:** Check logs and environment variables.

```bash
kubectl logs -f <pod-name> -n movienight
kubectl describe pod <pod-name> -n movienight

# Verify secret exists
kubectl get secret movienight-secrets -n movienight
```

### Issue: ALB not created

**Solution:** Ensure AWS Load Balancer Controller is installed.

```bash
kubectl get pods -n kube-system | grep aws-load-balancer-controller
```

---

## 📈 Monitoring & Scaling

### View Metrics

```bash
# HPA status
kubectl get hpa -n movienight

# Resource usage
kubectl top pods -n movienight
kubectl top nodes
```

### Update HPA Limits

Edit `MovieNight/k8s/hpa.yaml` and push to trigger redeployment.

---

## 🔐 Security Best Practices

- ✅ Never commit AWS credentials or API keys
- ✅ Use IAM roles with least privilege
- ✅ Rotate access keys regularly
- ✅ Enable MFA on AWS account
- ✅ Use GitHub environment secrets for production
- ✅ Enable branch protection on `main`
- ✅ Use HTTPS in production (add ACM certificate to ingress)

---

## 📚 Next Steps

1. **Configure Domain**: Point your domain to the ALB
2. **Enable HTTPS**: Add ACM certificate ARN to ingress
3. **Set up monitoring**: Add CloudWatch or Prometheus
4. **Configure alerts**: Set up SNS alerts for failures
5. **Add tests**: Implement CI tests before deployment
6. **Use staging environment**: Add staging workflow

---

## 🎉 You're Done!

MovieNight is now automatically deployed to your EKS cluster via GitHub Actions!

Every code push will trigger a new deployment. 🚀

**Need help?** Check the GitHub Actions logs or Kubernetes pod logs for detailed error messages.
