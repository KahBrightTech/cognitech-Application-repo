# PulseBoard

A polished analytics dashboard: React + Vite + Tailwind frontend, Node/Express backend API, containerized for deployment to Amazon EKS.

## Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, lucide-react icons
- **Backend**: Node.js 18, Express (mock analytics data — swap in a real data source when ready)
- **Containers**: multi-stage Dockerfiles (nginx serving the built frontend, Node running the API)
- **Orchestration**: Kubernetes manifests targeting Amazon EKS with an ALB Ingress

## Project layout

```
PulseBoard/
├── backend/           Express API (server.js, Dockerfile)
├── frontend/           React dashboard (src/, Dockerfile, nginx.conf)
├── k8s/                 Kubernetes manifests for EKS
└── docker-compose.yml   Local dev environment
```

## Run locally

```bash
cd PulseBoard
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:4000/api/stats

Or run without Docker:

```bash
# backend
cd backend && npm install && npm run dev

# frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Vite's dev server proxies `/api` to `http://localhost:4000` automatically (see `vite.config.js`).

## Build and push images to ECR

```bash
export AWS_ACCOUNT_ID=<your-account-id>
export AWS_REGION=us-east-1
export REPO=pulseboard

aws ecr create-repository --repository-name $REPO --region $AWS_REGION || true
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# backend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO:backend-latest ./backend
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO:backend-latest

# frontend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO:frontend-latest ./frontend
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO:frontend-latest
```

## Deploy to EKS

Prerequisites: an existing EKS cluster, `kubectl` configured against it, and the [AWS Load Balancer Controller](https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html) installed (needed for the `alb` Ingress class).

1. Update the image references in `k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml` — replace `YOUR_ACCOUNT_ID` with your AWS account ID.
2. Update the host in `k8s/ingress.yaml` (replace `pulseboard.example.com` with your domain, or remove the `host` field to accept any hostname).
3. Apply the manifests:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

4. Check status:

```bash
kubectl get pods -n pulseboard
kubectl get ingress -n pulseboard
```

The `ADDRESS` on the ingress is the ALB's DNS name — point your domain at it (CNAME) once it's provisioned (takes a couple of minutes).

## Notes

- The backend currently serves generated mock data (`GET /api/stats`, `/api/chart-data`, `/api/traffic`, `/api/activity`). Swap the handlers in `backend/server.js` for real queries when you have a data source.
- Both containers expose `/health` for liveness/readiness probes.
- Resource requests/limits in the manifests are intentionally small — tune them for your workload before running in production.
