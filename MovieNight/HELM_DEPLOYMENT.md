# 🎯 MovieNight Helm Deployment Guide

Complete guide for deploying MovieNight using Helm across multiple environments.

---

## 📁 Helm Chart Structure

```
MovieNight/helm/movienight/
├── Chart.yaml                    # Chart metadata
├── values.yaml                   # Default values
├── values-dev.yaml              # Dev environment overrides
├── values-staging.yaml          # Staging environment overrides
├── values-prod.yaml             # Production environment overrides
└── templates/
    ├── _helpers.tpl             # Template helpers
    ├── namespace.yaml           # Namespace definition
    ├── configmap.yaml           # Configuration
    ├── secret.yaml              # Secrets (TMDB API key)
    ├── backend-deployment.yaml  # Backend deployment
    ├── backend-service.yaml     # Backend service
    ├── frontend-deployment.yaml # Frontend deployment
    ├── frontend-service.yaml    # Frontend service
    ├── ingress.yaml             # ALB ingress
    └── hpa.yaml                 # Horizontal Pod Autoscaler
```

---

## 🚀 Quick Start

### Prerequisites

```powershell
# Install required tools
choco install kubernetes-helm
choco install awscli
choco install kubernetes-cli

# Verify installations
helm version
aws --version
kubectl version --client
```

### Configure AWS & EKS

```powershell
# Configure AWS credentials
aws configure

# Update kubeconfig
aws eks update-kubeconfig --name your-eks-cluster --region us-east-1
```

---

## 🌍 Environment-Based Deployment

### 1. Development Environment

**Auto-deploy on push to `develop` branch:**

```powershell
git checkout -b develop
git add .
git commit -m "Deploy to dev"
git push origin develop
```

**Manual deployment:**

```powershell
# Build and push images
cd MovieNight
./scripts/deploy-dev.sh

# Or use Helm directly
helm upgrade --install movienight ./helm/movienight \
  --namespace movienight-dev \
  --create-namespace \
  --values ./helm/movienight/values-dev.yaml \
  --set backend.image.tag=movienight-backend-dev-latest \
  --set frontend.image.tag=movienight-frontend-dev-latest \
  --set secrets.tmdbApiKey=$env:TMDB_API_KEY \
  --wait
```

**Access Dev:**
```powershell
kubectl get ingress -n movienight-dev
```

### 2. Staging Environment

**Auto-deploy on push to `staging` branch:**

```powershell
git checkout staging
git merge develop
git push origin staging
```

**Manual deployment:**

```powershell
helm upgrade --install movienight ./MovieNight/helm/movienight \
  --namespace movienight-staging \
  --create-namespace \
  --values ./MovieNight/helm/movienight/values-staging.yaml \
  --set backend.image.tag=movienight-backend-staging-latest \
  --set frontend.image.tag=movienight-frontend-staging-latest \
  --set secrets.tmdbApiKey=$env:TMDB_API_KEY \
  --wait
```

### 3. Production Environment

**Auto-deploy on push to `main` branch:**

```powershell
git checkout main
git merge staging
git push origin main
```

**Manual deployment with confirmation:**

```powershell
helm upgrade --install movienight ./MovieNight/helm/movienight \
  --namespace movienight \
  --create-namespace \
  --values ./MovieNight/helm/movienight/values-prod.yaml \
  --set backend.image.tag=movienight-backend-latest \
  --set frontend.image.tag=movienight-frontend-latest \
  --set secrets.tmdbApiKey=$env:TMDB_API_KEY \
  --atomic \
  --wait \
  --timeout 15m
```

---

## 📊 GitHub Actions Workflows

### Dev Workflow (.github/workflows/deploy-movienight-dev-helm.yml)

- **Trigger:** Push to `develop` branch
- **Namespace:** `movienight-dev`
- **Tags:** `movienight-*-dev-{sha}`, `movienight-*-dev-latest`
- **Values:** `values-dev.yaml`

### Staging Workflow (.github/workflows/deploy-movienight-staging-helm.yml)

- **Trigger:** Push to `staging` branch
- **Namespace:** `movienight-staging`
- **Tags:** `movienight-*-staging-{sha}`, `movienight-*-staging-latest`
- **Values:** `values-staging.yaml`

### Production Workflow (.github/workflows/deploy-movienight-prod-helm.yml)

- **Trigger:** Push to `main` branch OR manual with confirmation
- **Namespace:** `movienight`
- **Tags:** `movienight-*-{sha}`, `movienight-*-latest`
- **Values:** `values-prod.yaml`
- **Features:**
  - Automatic rollback on failure (`--atomic`)
  - Smoke tests (health checks)
  - Backup of previous release
  - Manual confirmation required for workflow_dispatch

---

## 🔧 Configuration

### Environment Variables

Each environment can override:

```yaml
# values-dev.yaml
backend:
  replicaCount: 1
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi

frontend:
  replicaCount: 1
  resources:
    requests:
      cpu: 50m
      memory: 64Mi

ingress:
  host: movienight-dev.your-domain.com
```

### Secrets Management

**Option 1: GitHub Secrets (Recommended for CI/CD)**

```yaml
# In GitHub Actions workflow
--set secrets.tmdbApiKey=${{ secrets.TMDB_API_KEY }}
```

**Option 2: Manual Secret Creation**

```powershell
kubectl create secret generic movienight-secrets \
  --from-literal=tmdb-api-key=YOUR_API_KEY \
  --namespace movienight-dev
```

**Option 3: Environment Variable**

```powershell
$env:TMDB_API_KEY = "your-api-key"
helm upgrade --install ... --set secrets.tmdbApiKey=$env:TMDB_API_KEY
```

---

## 📝 Helm Commands Reference

### Install/Upgrade

```powershell
# Install new release
helm install movienight ./MovieNight/helm/movienight -n movienight

# Upgrade existing release
helm upgrade movienight ./MovieNight/helm/movienight -n movienight

# Install or upgrade (recommended)
helm upgrade --install movienight ./MovieNight/helm/movienight -n movienight
```

### List Releases

```powershell
# All releases
helm list -A

# Specific namespace
helm list -n movienight-dev
```

### Get Release Info

```powershell
# Get release status
helm status movienight -n movienight

# Get values used
helm get values movienight -n movienight

# Get all manifests
helm get manifest movienight -n movienight

# Get release history
helm history movienight -n movienight
```

### Rollback

```powershell
# Rollback to previous version
helm rollback movienight -n movienight

# Rollback to specific revision
helm rollback movienight 3 -n movienight

# Dry run
helm rollback movienight --dry-run -n movienight
```

### Uninstall

```powershell
# Uninstall release
helm uninstall movienight -n movienight

# Keep release history
helm uninstall movienight -n movienight --keep-history
```

### Debug

```powershell
# Dry run to see what would be deployed
helm upgrade --install movienight ./MovieNight/helm/movienight \
  --namespace movienight-dev \
  --values ./MovieNight/helm/movienight/values-dev.yaml \
  --dry-run \
  --debug

# Template without installing
helm template movienight ./MovieNight/helm/movienight \
  --namespace movienight-dev \
  --values ./MovieNight/helm/movienight/values-dev.yaml
```

---

## 🔍 Monitoring Deployments

### Watch Deployment

```powershell
# Watch pods
kubectl get pods -n movienight -w

# Watch all resources
kubectl get all -n movienight -w

# Watch events
kubectl get events -n movienight --watch
```

### Check Pod Status

```powershell
# Get pod details
kubectl describe pod <pod-name> -n movienight

# Get pod logs
kubectl logs -f deployment/movienight-backend -n movienight
kubectl logs -f deployment/movienight-frontend -n movienight

# Get logs from all backend pods
kubectl logs -l app=movienight-backend -n movienight --tail=100
```

### Check Resource Usage

```powershell
# Top pods
kubectl top pods -n movienight

# Top nodes
kubectl top nodes

# HPA status
kubectl get hpa -n movienight
kubectl describe hpa movienight-backend -n movienight
```

### Check Ingress

```powershell
# Get ingress details
kubectl get ingress -n movienight
kubectl describe ingress movienight-ingress -n movienight

# Get ALB URL
kubectl get ingress movienight-ingress -n movienight -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

---

## 🧪 Testing After Deployment

### Quick Health Check

```powershell
# Using PowerShell script
cd MovieNight
.\scripts\health-check.ps1 -Url "http://your-alb-url" -Environment "dev"

# Using bash script
./scripts/smoke-test.sh dev http://your-alb-url
```

### Load Testing

```powershell
# Install k6
choco install k6

# Run load test
cd MovieNight/scripts
k6 run load-test.js --env BASE_URL=http://your-alb-url
```

### Manual Testing

```powershell
# Port forward for local testing
kubectl port-forward -n movienight svc/movienight-frontend 8080:80
kubectl port-forward -n movienight svc/movienight-backend 3001:3001

# Open browser
start http://localhost:8080
```

---

## 🔄 Update Strategies

### Rolling Update (Default)

```yaml
# In deployment template
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

This ensures zero downtime during updates.

### Blue-Green Deployment

```powershell
# Deploy new version to staging
helm upgrade --install movienight-blue ./MovieNight/helm/movienight \
  --namespace movienight-staging \
  --set backend.image.tag=new-version

# Test staging
./scripts/smoke-test.sh staging http://staging-alb

# Switch to production
helm upgrade --install movienight ./MovieNight/helm/movienight \
  --namespace movienight \
  --set backend.image.tag=new-version
```

### Canary Deployment

Use Argo Rollouts or Flagger for advanced canary deployments.

---

## 🛡️ Production Checklist

Before deploying to production:

- [ ] **Tested in staging** - All features work
- [ ] **Load tested** - Can handle expected traffic
- [ ] **Security review** - Secrets properly managed
- [ ] **Monitoring setup** - CloudWatch alarms configured
- [ ] **Backup taken** - Previous release backed up
- [ ] **Rollback plan** - Know how to rollback quickly
- [ ] **Team notified** - Everyone knows about deployment
- [ ] **DNS configured** - Domain points to ALB
- [ ] **SSL/TLS ready** - Certificate configured (if using HTTPS)
- [ ] **Documentation updated** - README and guides current

---

## 🆘 Troubleshooting

### Pods Not Starting

```powershell
# Check pod events
kubectl describe pod <pod-name> -n movienight

# Check logs
kubectl logs <pod-name> -n movienight

# Check image pull issues
kubectl get events -n movienight | grep -i pull
```

### Helm Install Failed

```powershell
# Check what was deployed
kubectl get all -n movienight

# Delete and retry
helm uninstall movienight -n movienight
helm install movienight ./MovieNight/helm/movienight -n movienight --debug
```

### Configuration Issues

```powershell
# Verify values
helm get values movienight -n movienight

# Check configmap
kubectl get configmap -n movienight
kubectl describe configmap movienight-config -n movienight

# Check secrets
kubectl get secrets -n movienight
kubectl describe secret movienight-secrets -n movienight
```

### Ingress Not Working

```powershell
# Check ingress
kubectl describe ingress movienight-ingress -n movienight

# Check AWS Load Balancer Controller
kubectl get pods -n kube-system | grep aws-load-balancer-controller

# Check ALB logs in AWS Console
```

### WebSocket Connection Issues

```powershell
# Verify session affinity
kubectl get svc movienight-backend -n movienight -o yaml | grep sessionAffinity

# Should show:
#   sessionAffinity: ClientIP
```

---

## 🎯 Best Practices

1. **Always use `--atomic` in production** - Automatic rollback on failure
2. **Test in dev/staging first** - Never deploy directly to production
3. **Use Git tags for releases** - Tag production releases (v1.0.0, etc.)
4. **Monitor after deployment** - Watch logs and metrics for 15+ minutes
5. **Keep Helm releases clean** - Uninstall old test releases
6. **Use namespaces** - Isolate environments
7. **Version your chart** - Increment version in Chart.yaml for changes
8. **Document changes** - Update CHANGELOG.md

---

## 📚 Additional Resources

- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)

---

## 🎬 Quick Commands Cheat Sheet

```powershell
# Deploy to dev
git push origin develop

# Deploy to staging
git push origin staging

# Deploy to production
git push origin main

# Check status
kubectl get pods -n movienight

# Get logs
kubectl logs -f deployment/movienight-backend -n movienight

# Rollback
helm rollback movienight -n movienight

# Health check
.\scripts\health-check.ps1 -Url "http://your-url"

# Load test
k6 run scripts/load-test.js --env BASE_URL=http://your-url
```

---

**Happy deploying! 🍿🚀**
