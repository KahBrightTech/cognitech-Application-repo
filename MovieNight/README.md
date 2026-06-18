# 🍿 MovieNight

**Swipe together, watch together!**

MovieNight is a beautiful, real-time social app that helps friends decide what movie to watch together. Create a session, invite your friends, swipe on movies, and discover what everyone loves!

![MovieNight Demo](https://via.placeholder.com/800x400?text=MovieNight+Demo)

## ✨ Features

- 🎬 **Swipe Interface** - Intuitive Tinder-style movie swiping
- 👥 **Real-time Collaboration** - See when friends join and swipe
- ✨ **Instant Matches** - Discover movies everyone loves
- 🎨 **Beautiful UI** - Modern, gradient-based design with smooth animations
- 📱 **Fully Responsive** - Works great on all devices
- 🎥 **Rich Movie Data** - Powered by TMDB API with trailers, ratings, and details
- 🚀 **Production Ready** - Docker & Kubernetes deployment included

## 🏗️ Architecture

- **Frontend**: React + Vite, TailwindCSS, Socket.io Client
- **Backend**: Node.js + Express, Socket.io, TMDB API
- **Deployment**: Docker, Docker Compose, Kubernetes (EKS)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for local development)
- Docker & Docker Compose (for containerized deployment)
- TMDB API Key ([Get it free here](https://www.themoviedb.org/settings/api))

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MovieNight
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your TMDB_API_KEY
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Add your TMDB_API_KEY to backend/.env
   npm run dev
   ```

4. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Docker Compose (Recommended)

1. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your TMDB_API_KEY
   ```

2. **Build and run**
   ```bash
   docker-compose up -d
   ```

3. **Access the app**
   - http://localhost

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

5. **Stop the app**
   ```bash
   docker-compose down
   ```

## ☁️ Deploy to AWS EKS

### Prerequisites

- AWS CLI configured
- kubectl installed and configured for your EKS cluster
- ECR repository created
- AWS Load Balancer Controller installed in your EKS cluster

### Step 1: Build and Push Docker Images

```bash
# Set your AWS account ID and region
export AWS_ACCOUNT_ID=123456789012
export AWS_REGION=us-east-1
export ECR_REGISTRY=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Login to ECR
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Create ECR repositories (if not exists)
aws ecr create-repository --repository-name movienight-backend --region ${AWS_REGION}
aws ecr create-repository --repository-name movienight-frontend --region ${AWS_REGION}

# Build and push backend
cd backend
docker build -t ${ECR_REGISTRY}/movienight-backend:latest .
docker push ${ECR_REGISTRY}/movienight-backend:latest

# Build and push frontend
cd ../frontend
docker build -t ${ECR_REGISTRY}/movienight-frontend:latest .
docker push ${ECR_REGISTRY}/movienight-frontend:latest
```

### Step 2: Update Kubernetes Manifests

Update the image URLs in the Kubernetes manifests:

```bash
# Update k8s/backend-deployment.yaml
sed -i "s|YOUR_ECR_REPO|${ECR_REGISTRY}|g" k8s/backend-deployment.yaml

# Update k8s/frontend-deployment.yaml
sed -i "s|YOUR_ECR_REPO|${ECR_REGISTRY}|g" k8s/frontend-deployment.yaml

# Update k8s/ingress.yaml with your domain
sed -i "s|movienight.example.com|your-domain.com|g" k8s/ingress.yaml
```

### Step 3: Create Kubernetes Secret

```bash
# Create the secret with your TMDB API key
kubectl create secret generic movienight-secrets \
  --from-literal=tmdb-api-key=YOUR_ACTUAL_TMDB_API_KEY \
  -n movienight --dry-run=client -o yaml | kubectl apply -f -
```

### Step 4: Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Check deployment status
kubectl get all -n movienight

# Get the Load Balancer URL
kubectl get ingress -n movienight
```

### Step 5: Access Your App

```bash
# Get the ALB DNS name
ALB_URL=$(kubectl get ingress movienight-ingress -n movienight -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Access your app at: http://${ALB_URL}"
```

## 📦 Project Structure

```
MovieNight/
├── backend/                 # Node.js backend
│   ├── server.js           # Express + Socket.io server
│   ├── package.json        # Backend dependencies
│   ├── Dockerfile          # Backend Docker image
│   └── .env.example        # Environment variables template
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── components/    # React components
│   │   └── services/      # API & Socket services
│   ├── package.json       # Frontend dependencies
│   ├── Dockerfile         # Frontend Docker image
│   └── nginx.conf         # Nginx configuration
├── k8s/                   # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
├── docker-compose.yml     # Docker Compose configuration
└── README.md             # This file
```

## 🎮 How to Use

1. **Create a Session**: Click "Create Movie Night" and enter your name
2. **Share the Code**: Share the 6-character session code with friends
3. **Friends Join**: Friends enter the code to join your session
4. **Start Swiping**: Swipe right ❤️ to like, left ✕ to pass
5. **Find Matches**: When everyone likes a movie, it's a match! 🎉
6. **Watch Together**: Check your matches and pick one to watch

## 🔧 Configuration

### Environment Variables

**Backend** (`.env` or `backend/.env`):
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `TMDB_API_KEY` - Your TMDB API key (required)
- `CORS_ORIGIN` - Allowed CORS origin

**Frontend** (build-time):
- `VITE_API_URL` - Backend API URL

### Kubernetes Configuration

Edit `k8s/configmap.yaml` to update:
- `CORS_ORIGIN` - Your frontend domain
- Other environment variables

## 📊 Monitoring

### Health Checks

- Backend: `http://localhost:3001/health`
- Frontend: `http://localhost/health` (when using Docker)

### Kubernetes Resources

```bash
# Check pod status
kubectl get pods -n movienight

# Check logs
kubectl logs -f deployment/movienight-backend -n movienight
kubectl logs -f deployment/movienight-frontend -n movienight

# Check HPA status
kubectl get hpa -n movienight

# Check ingress
kubectl describe ingress movienight-ingress -n movienight
```

## 🔐 Security Considerations

1. **Never commit secrets** - Use Kubernetes secrets for sensitive data
2. **Use HTTPS in production** - Configure ACM certificate in ingress
3. **Enable CORS properly** - Update CORS_ORIGIN in production
4. **Rate limiting** - Consider adding rate limiting for API endpoints
5. **Input validation** - Backend validates all user inputs

## 🚀 Scaling

The app is configured with Horizontal Pod Autoscaling (HPA):

- **Backend**: 2-10 replicas (scales at 70% CPU)
- **Frontend**: 2-5 replicas (scales at 70% CPU)

Adjust in `k8s/hpa.yaml` based on your needs.

## 🐛 Troubleshooting

### Docker Issues

```bash
# Rebuild without cache
docker-compose build --no-cache

# Check container logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Kubernetes Issues

```bash
# Check pod logs
kubectl logs -f <pod-name> -n movienight

# Describe pod for events
kubectl describe pod <pod-name> -n movienight

# Check service endpoints
kubectl get endpoints -n movienight

# Test service connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -n movienight -- sh
```

### Common Issues

1. **TMDB API errors**: Verify your API key is correct
2. **WebSocket connection fails**: Check CORS settings and session affinity
3. **Images not loading**: Ensure ECR images are pushed and URLs updated
4. **ALB not created**: Verify AWS Load Balancer Controller is installed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for any purpose!

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the amazing movie database API
- [Socket.io](https://socket.io/) for real-time communication
- [React Spring](https://www.react-spring.dev/) for smooth animations

## 📧 Support

If you have any questions or issues, please open an issue on GitHub.

---

**Made with ❤️ for movie lovers everywhere! 🍿**
