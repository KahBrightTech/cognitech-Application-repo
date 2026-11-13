# 🧪 MovieNight Testing Guide

Complete guide for testing MovieNight before deploying to production.

---

## 📋 Testing Strategy

```
Local → Dev → Staging → Production
  ↓       ↓       ↓         ↓
Docker   EKS     EKS       EKS
```

### Testing Levels:
1. **Local Testing** - Docker Compose on your machine
2. **Dev Environment** - Kubernetes dev cluster
3. **Staging Environment** - Production-like environment
4. **Production** - Live production deployment

---

## 🏠 1. Local Testing (Before Any Deployment)

### Option A: Docker Compose (Fastest)

```powershell
cd MovieNight

# Create .env file
Copy-Item .env.example .env
# Edit .env and add your TMDB_API_KEY

# Build and run
docker-compose up --build

# Test in browser
# Open: http://localhost
```

**What to test:**
- ✅ App loads without errors
- ✅ Create session works
- ✅ Join session works
- ✅ Movie swiping works
- ✅ WebSocket real-time updates work
- ✅ Match detection works
- ✅ No console errors

### Option B: Local Kubernetes with Minikube/Kind

```powershell
# Start Minikube
minikube start

# Install Helm chart locally
helm install movienight ./helm/movienight \
  --namespace movienight-local \
  --create-namespace \
  --values ./helm/movienight/values-dev.yaml \
  --set backend.image.tag=movienight-backend-dev-latest \
  --set frontend.image.tag=movienight-frontend-dev-latest \
  --set secrets.tmdbApiKey=YOUR_TMDB_API_KEY

# Port forward to access
kubectl port-forward -n movienight-local svc/movienight-frontend 8080:80
kubectl port-forward -n movienight-local svc/movienight-backend 3001:3001

# Test in browser
# Open: http://localhost:8080
```

### Run Automated Tests

```powershell
# Backend unit tests (if you add them)
cd backend
npm test

# Frontend unit tests (if you add them)
cd frontend
npm test

# Integration tests
cd MovieNight
./scripts/test-integration.sh
```

---

## 🧪 2. Dev Environment Testing

### Deploy to Dev

Push to `develop` branch (GitHub Actions will auto-deploy):

```powershell
git checkout -b develop
git add .
git commit -m "feat: Ready for dev testing"
git push origin develop
```

Or manually deploy:

```powershell
# Build and push images
./MovieNight/scripts/deploy-dev.sh

# Or use Helm directly
helm upgrade --install movienight ./MovieNight/helm/movienight \
  --namespace movienight-dev \
  --create-namespace \
  --values ./MovieNight/helm/movienight/values-dev.yaml \
  --set backend.image.tag=movienight-backend-dev-latest \
  --set frontend.image.tag=movienight-frontend-dev-latest \
  --set secrets.tmdbApiKey=$TMDB_API_KEY
```

### Test in Dev

```powershell
# Get the dev URL
kubectl get ingress -n movienight-dev

# Or use port-forward for testing
kubectl port-forward -n movienight-dev svc/movienight-frontend 8080:80
```

**Dev Testing Checklist:**
- [ ] All features work end-to-end
- [ ] WebSocket connections stable
- [ ] No memory leaks (monitor pods)
- [ ] API responses are fast
- [ ] Error handling works
- [ ] Logs are clean (no errors)

### Monitor Dev Deployment

```powershell
# Watch pods
kubectl get pods -n movienight-dev -w

# Check logs
kubectl logs -f -n movienight-dev deployment/movienight-backend
kubectl logs -f -n movienight-dev deployment/movienight-frontend

# Check resource usage
kubectl top pods -n movienight-dev

# Check HPA
kubectl get hpa -n movienight-dev
```

---

## 🎭 3. Staging Environment Testing (Pre-Production)

### Deploy to Staging

Push to `staging` branch:

```powershell
git checkout staging
git merge develop
git push origin staging
```

### Staging Testing Checklist

**Functional Testing:**
- [ ] Create and join sessions
- [ ] Swipe on movies (10+ swipes)
- [ ] Real-time synchronization between users
- [ ] Match detection and display
- [ ] View all matched movies
- [ ] WebSocket reconnection after disconnect
- [ ] Session persistence

**Performance Testing:**
- [ ] Load test with multiple concurrent users
- [ ] Monitor response times
- [ ] Check auto-scaling behavior
- [ ] Verify WebSocket connection limits
- [ ] Test with 50+ concurrent sessions

**Security Testing:**
- [ ] CORS is properly configured
- [ ] Secrets are not exposed in logs
- [ ] Health endpoints work
- [ ] Invalid requests are handled

**Integration Testing:**
- [ ] TMDB API integration works
- [ ] Movie data loads correctly
- [ ] Images load properly
- [ ] Video trailers work

### Load Testing Staging

```powershell
# Install k6 (load testing tool)
choco install k6

# Run load test
cd MovieNight/tests
k6 run load-test.js --vus 50 --duration 5m
```

### Smoke Tests

```bash
#!/bin/bash
# Run smoke tests against staging

STAGING_URL="your-staging-alb-url.amazonaws.com"

echo "Running smoke tests..."

# Test backend health
curl -f http://${STAGING_URL}/api/health || exit 1

# Test frontend loads
curl -f http://${STAGING_URL}/ || exit 1

# Test session creation
SESSION_RESPONSE=$(curl -s -X POST http://${STAGING_URL}/api/sessions)
SESSION_CODE=$(echo $SESSION_RESPONSE | jq -r '.sessionCode')

if [ -z "$SESSION_CODE" ]; then
  echo "❌ Session creation failed"
  exit 1
fi

echo "✅ All smoke tests passed!"
```

---

## 🚀 4. Production Deployment

### Pre-Production Checklist

Before deploying to production:

- [ ] All staging tests passed
- [ ] Load tests completed successfully
- [ ] Security review done
- [ ] Monitoring/alerts configured
- [ ] Rollback plan ready
- [ ] Team notified of deployment
- [ ] Database backups current (if applicable)
- [ ] SSL certificate configured
- [ ] Domain DNS pointing to ALB

### Deploy to Production

**Option A: Automatic (Push to main)**
```powershell
git checkout main
git merge staging
git push origin main
```

**Option B: Manual Trigger with Confirmation**
Go to GitHub Actions → Deploy to Production → Run workflow → Type `deploy-to-production`

### Post-Deployment Verification

```powershell
# Check deployment status
kubectl get pods -n movienight

# Verify all pods are running
kubectl wait --for=condition=ready pod -l app=movienight -n movienight --timeout=300s

# Check Helm release
helm list -n movienight

# Get production URL
kubectl get ingress movienight-ingress -n movienight

# Run smoke tests
curl -f https://your-domain.com/api/health
```

### Monitor Production

```powershell
# Watch pods in real-time
watch kubectl get pods -n movienight

# Check logs for errors
kubectl logs -f -n movienight deployment/movienight-backend --tail=100

# Monitor resource usage
kubectl top pods -n movienight

# Check HPA scaling
kubectl get hpa -n movienight -w
```

---

## 🔄 Rollback Procedures

### Automatic Rollback (Helm)

If deployment fails, it automatically rolls back:

```yaml
# In GitHub Actions workflow
--atomic  # Automatic rollback on failure
```

### Manual Rollback

```powershell
# List previous releases
helm history movienight -n movienight

# Rollback to previous version
helm rollback movienight -n movienight

# Rollback to specific revision
helm rollback movienight 5 -n movienight

# Verify rollback
helm list -n movienight
kubectl get pods -n movienight
```

---

## 📊 Testing Tools & Scripts

### 1. Integration Test Script

```bash
#!/bin/bash
# tests/integration-test.sh

API_URL="${1:-http://localhost:3001}"

echo "🧪 Running integration tests..."

# Test 1: Health check
echo "Test 1: Health check"
curl -f ${API_URL}/health || exit 1

# Test 2: Create session
echo "Test 2: Create session"
SESSION=$(curl -s -X POST ${API_URL}/api/sessions)
SESSION_ID=$(echo $SESSION | jq -r '.sessionId')
echo "Session created: $SESSION_ID"

# Test 3: Get movies
echo "Test 3: Get movies"
curl -f ${API_URL}/api/movies || exit 1

# Test 4: Get genres
echo "Test 4: Get genres"
curl -f ${API_URL}/api/genres || exit 1

echo "✅ All integration tests passed!"
```

### 2. Load Test Script (k6)

```javascript
// tests/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  // Create session
  let createRes = http.post(`${BASE_URL}/api/sessions`);
  check(createRes, {
    'session created': (r) => r.status === 200,
  });

  let sessionData = createRes.json();
  
  // Get movies
  let moviesRes = http.get(`${BASE_URL}/api/movies`);
  check(moviesRes, {
    'movies loaded': (r) => r.status === 200,
  });

  sleep(1);
}
```

Run it:
```powershell
k6 run tests/load-test.js --env BASE_URL=http://your-staging-url
```

### 3. Health Check Script

```powershell
# scripts/health-check.ps1
param(
    [string]$Url = "http://localhost",
    [string]$Environment = "local"
)

Write-Host "🏥 Health Check for $Environment" -ForegroundColor Cyan

# Test backend
Write-Host "Testing backend..." -ForegroundColor Yellow
$backendHealth = Invoke-RestMethod -Uri "$Url/api/health" -Method Get
if ($backendHealth.status -eq "healthy") {
    Write-Host "✅ Backend is healthy" -ForegroundColor Green
} else {
    Write-Host "❌ Backend is unhealthy" -ForegroundColor Red
    exit 1
}

# Test frontend
Write-Host "Testing frontend..." -ForegroundColor Yellow
$frontendResponse = Invoke-WebRequest -Uri "$Url/" -Method Get
if ($frontendResponse.StatusCode -eq 200) {
    Write-Host "✅ Frontend is accessible" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend is not accessible" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ All health checks passed!" -ForegroundColor Green
```

---

## 🎯 Quick Testing Commands

### Local Testing
```powershell
cd MovieNight
docker-compose up --build
# Open: http://localhost
```

### Dev Testing
```powershell
git push origin develop
# Check GitHub Actions
# Test at dev ALB URL
```

### Staging Testing
```powershell
git push origin staging
./scripts/smoke-test.sh staging
./scripts/load-test.sh staging
```

### Production
```powershell
git push origin main
# Monitor deployment
watch kubectl get pods -n movienight
```

---

## 📈 Monitoring & Alerts

### Set Up CloudWatch Alarms

```powershell
# CPU utilization alert
aws cloudwatch put-metric-alarm \
  --alarm-name movienight-high-cpu \
  --alarm-description "MovieNight high CPU usage" \
  --metric-name CPUUtilization \
  --namespace AWS/EKS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Check Application Logs

```powershell
# Backend logs
kubectl logs -f -n movienight deployment/movienight-backend --tail=100

# Frontend logs
kubectl logs -f -n movienight deployment/movienight-frontend --tail=100

# Filter for errors
kubectl logs -n movienight deployment/movienight-backend | grep ERROR
```

---

## ✅ Testing Checklist Summary

**Before ANY deployment:**
- [ ] Local Docker Compose testing passed
- [ ] All features work locally
- [ ] No console errors

**Before Staging:**
- [ ] Dev environment tested
- [ ] Integration tests passed
- [ ] Code reviewed

**Before Production:**
- [ ] Staging tests passed
- [ ] Load tests successful
- [ ] Security review complete
- [ ] Monitoring configured
- [ ] Rollback plan ready

---

## 🆘 Troubleshooting

### Pods not starting
```powershell
kubectl describe pod <pod-name> -n movienight
kubectl logs <pod-name> -n movienight
```

### WebSocket issues
```powershell
# Check service session affinity
kubectl get svc movienight-backend -n movienight -o yaml | grep sessionAffinity
```

### High latency
```powershell
# Check HPA status
kubectl get hpa -n movienight

# Check resource limits
kubectl top pods -n movienight
```

---

## 📚 Additional Resources

- [Helm Documentation](https://helm.sh/docs/)
- [k6 Load Testing](https://k6.io/docs/)
- [Kubernetes Debugging](https://kubernetes.io/docs/tasks/debug/)
- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)

---

**Remember:** Test early, test often, and never skip staging! 🎯
