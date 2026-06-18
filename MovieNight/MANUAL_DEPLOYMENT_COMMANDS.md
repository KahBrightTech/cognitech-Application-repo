# Manual Deployment Commands for MovieNight

## How to Trigger Workflow Manually

To see the deployment options in GitHub Actions:

1. Go to your repository on GitHub
2. Click the **Actions** tab at the top
3. Click **Deploy MovieNight** in the left sidebar
4. Click the **Run workflow** button (dropdown on the right)
5. Select your desired option from "What do you want to do?":
   - **Build images + Deploy to cluster** - Builds Docker images and deploys to Kubernetes
   - **Build images only (no deployment)** - Just builds and pushes to ECR, no K8s deployment
   - **Delete deployment from cluster** - Removes all MovieNight resources from K8s
6. Click the green **Run workflow** button

---

## Manual Kubernetes Commands

If you want to manage deployments manually via kubectl:

### Setup: Connect to EKS Cluster

```bash
# Configure kubectl to connect to your EKS cluster
aws eks update-kubeconfig \
  --name int-production-use1-prod-novutech-eks-cluster \
  --region us-east-1
```

### View Current Deployments

```bash
# List all resources in movienight namespace
kubectl get all -n movienight

# View pods
kubectl get pods -n movienight

# View deployments
kubectl get deployments -n movienight

# View services
kubectl get services -n movienight

# Describe a specific pod (for troubleshooting)
kubectl describe pod <pod-name> -n movienight

# View pod logs
kubectl logs <pod-name> -n movienight

# Follow logs in real-time
kubectl logs -f <pod-name> -n movienight
```

### Delete Deployments Manually

```bash
# Delete backend deployment
kubectl delete deployment movienight-backend -n movienight

# Delete frontend deployment
kubectl delete deployment movienight-frontend -n movienight

# Delete all services
kubectl delete service movienight-backend -n movienight
kubectl delete service movienight-frontend -n movienight

# Delete secrets
kubectl delete secret movienight-secrets -n movienight

# OR delete everything at once
kubectl delete deployment,service,secret --all -n movienight
```

### Scale Deployments

```bash
# Scale backend to 0 replicas (stops all backend pods)
kubectl scale deployment movienight-backend --replicas=0 -n movienight

# Scale backend back to 1 replica
kubectl scale deployment movienight-backend --replicas=1 -n movienight

# Scale frontend
kubectl scale deployment movienight-frontend --replicas=1 -n movienight
```

### Update Image Version

```bash
# Update backend to specific version
kubectl set image deployment/movienight-backend \
  backend=271457809232.dkr.ecr.us-east-1.amazonaws.com/int-production-use1-ecs:movienight-backend-v1.0.5 \
  -n movienight

# Update frontend to specific version
kubectl set image deployment/movienight-frontend \
  frontend=271457809232.dkr.ecr.us-east-1.amazonaws.com/int-production-use1-ecs:movienight-frontend-v1.0.5 \
  -n movienight
```

### Restart Deployments (rolling restart)

```bash
# Restart backend (useful after config changes)
kubectl rollout restart deployment/movienight-backend -n movienight

# Restart frontend
kubectl rollout restart deployment/movienight-frontend -n movienight

# Check rollout status
kubectl rollout status deployment/movienight-backend -n movienight
```

### View Deployment History

```bash
# View rollout history
kubectl rollout history deployment/movienight-backend -n movienight

# Rollback to previous version
kubectl rollout undo deployment/movienight-backend -n movienight

# Rollback to specific revision
kubectl rollout undo deployment/movienight-backend --to-revision=2 -n movienight
```

### Delete Entire Namespace (Nuclear Option)

```bash
# WARNING: This deletes EVERYTHING in the movienight namespace
kubectl delete namespace movienight

# Recreate it
kubectl create namespace movienight
```

---

## Troubleshooting "Too Many Pods" Error

If you see `0/2 nodes are available: 2 Too many pods`:

**Option 1: Delete old deployments**
```bash
# Delete MovieNight deployments
kubectl delete deployment movienight-backend movienight-frontend -n movienight
```

**Option 2: Scale down other deployments**
```bash
# List all deployments across all namespaces
kubectl get deployments --all-namespaces

# Scale down a deployment in another namespace
kubectl scale deployment <deployment-name> --replicas=0 -n <namespace>
```

**Option 3: Check pod distribution**
```bash
# See which pods are running on which nodes
kubectl get pods --all-namespaces -o wide

# See node resource usage
kubectl top nodes
kubectl top pods --all-namespaces
```

**Option 4: Add more nodes to cluster**
```bash
# This requires AWS console or eksctl
eksctl scale nodegroup --cluster=int-production-use1-prod-novutech-eks-cluster --nodes=3 --region=us-east-1
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| View all resources | `kubectl get all -n movienight` |
| Delete deployment | `kubectl delete deployment <name> -n movienight` |
| Scale to 0 | `kubectl scale deployment <name> --replicas=0 -n movienight` |
| View logs | `kubectl logs <pod-name> -n movienight` |
| Restart deployment | `kubectl rollout restart deployment/<name> -n movienight` |
| Delete everything | `kubectl delete namespace movienight` |

---

## ECR Image Management

```bash
# List all images in ECR
aws ecr list-images \
  --repository-name int-production-use1-ecs \
  --region us-east-1

# View image details with tags
aws ecr describe-images \
  --repository-name int-production-use1-ecs \
  --region us-east-1 \
  --query 'sort_by(imageDetails,& imagePushedAt)[*].[imageTags[0], imagePushedAt]' \
  --output table

# Delete specific image by tag
aws ecr batch-delete-image \
  --repository-name int-production-use1-ecs \
  --region us-east-1 \
  --image-ids imageTag=movienight-backend-v1.0.1

# Delete old SHA-tagged images (cleanup)
aws ecr batch-delete-image \
  --repository-name int-production-use1-ecs \
  --region us-east-1 \
  --image-ids imageTag=movienight-backend-2dcce48099a25638940a301d19e393828a642a3d
```
