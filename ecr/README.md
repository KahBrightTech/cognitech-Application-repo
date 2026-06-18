# 🐳 Multi-App ECR Build & Push Tool

Centralized ECR image building and pushing for all applications in the repository.

## 🎯 Features

- **Auto-Discovery**: Automatically scans and detects all applications in the repo
- **Interactive Selection**: Choose which app to build and which ECR repo to push to
- **Multi-Component Support**: Handles apps with backend, frontend, or single containers
- **Semantic Versioning**: Auto-increments versions per app component (v1.0.0 → v1.0.1)
- **Smart Tagging**: Pushes both versioned tags and "latest" tags
- **Cross-Platform**: Bash script for Linux/Mac, PowerShell for Windows

## 📁 Directory Structure

```
cognitech-Application-repo/
├── ecr/                     # This folder
│   ├── build-and-push.sh    # Bash script
│   ├── build-and-push.ps1   # PowerShell script
│   └── README.md            # This file
├── MovieNight/              # Detected app
│   ├── backend/
│   └── frontend/
├── HirePath/                # Detected app
│   ├── backend/
│   └── frontend/
└── DayTrack/                # Detected app
```

## 🚀 Usage

### Linux/Mac (Bash)

```bash
cd ecr
chmod +x build-and-push.sh
./build-and-push.sh
```

### Windows (PowerShell)

```powershell
cd ecr
.\build-and-push.ps1
```

## 📋 Interactive Workflow

The script will guide you through:

### 1️⃣ Application Selection
```
Found 3 applications:
  1. MovieNight (backend + frontend)
  2. HirePath (backend + frontend)
  3. DayTrack (single container)

Which application do you want to build?
Enter number (1-3):
```

### 2️⃣ ECR Repository Selection
```
Found 2 ECR repositories:
  1. int-production-use1-ecs
  2. my-other-ecr-repo

Which repository do you want to push to?
Enter number (1-2):
```

### 3️⃣ Automatic Build & Push
The script will:
- Login to ECR
- Detect components (backend/frontend)
- Auto-increment versions
- Build Docker images
- Tag with version and "latest"
- Push to selected ECR repository

## 🏷️ Image Tagging Convention

For an app named "MovieNight":

**Backend:**
- `movienight-backend-v1.0.5` (versioned)
- `movienight-backend-latest` (always newest)

**Frontend:**
- `movienight-frontend-v1.0.5` (versioned)
- `movienight-frontend-latest` (always newest)

**Single Container Apps:**
- `appname-v1.0.5` (versioned)
- `appname-latest` (always newest)

## 🔍 App Detection Logic

The script scans for folders that contain:

✅ **Detected as Apps:**
- Folders with `backend/` subdirectory
- Folders with `frontend/` subdirectory
- Folders with `Dockerfile` at root
- Folders with `docker-compose.yml`

❌ **Ignored:**
- `node_modules/`
- `.git/`
- `ecr/`
- `.github/`

## 📦 Supported App Structures

### Multi-Tier (Backend + Frontend)
```
MovieNight/
├── backend/
│   └── Dockerfile
└── frontend/
    └── Dockerfile
```
**Result:** Builds 2 images with separate versions

### Backend Only
```
HirePath/
└── backend/
    └── Dockerfile
```
**Result:** Builds 1 backend image

### Single Container
```
DayTrack/
└── Dockerfile
```
**Result:** Builds 1 image

## 🔧 Prerequisites

### Required Tools
- **AWS CLI** - [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **Docker** - Must be running
- **AWS Credentials** - Configured via `aws configure`

### AWS Permissions Required
- `sts:GetCallerIdentity`
- `ecr:GetAuthorizationToken`
- `ecr:DescribeRepositories`
- `ecr:DescribeImages`
- `ecr:BatchCheckLayerAvailability`
- `ecr:PutImage`
- `ecr:InitiateLayerUpload`
- `ecr:UploadLayerPart`
- `ecr:CompleteLayerUpload`

## 🌍 Environment Variables

```bash
export AWS_REGION=us-west-2  # Default: us-east-1
./build-and-push.sh
```

```powershell
$env:AWS_REGION = "us-west-2"  # Default: us-east-1
.\build-and-push.ps1
```

## 🎯 Example Output

```
╔════════════════════════════════════════╗
║  🐳 Multi-App ECR Build & Push Tool   ║
╚════════════════════════════════════════╝

🔍 Scanning for applications...
Found 3 applications:
  1. MovieNight (backend + frontend)
  2. HirePath (backend + frontend)
  3. DayTrack (single container)

Which application do you want to build?
Enter number (1-3): 1

✅ Selected application: MovieNight

📦 Fetching ECR repositories...
Found 2 ECR repositories:
  1. int-production-use1-ecs
  2. my-dev-ecr

Which repository do you want to push to?
Enter number (1-2): 1

✅ Selected repository: int-production-use1-ecs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔨 Building Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Version: v1.0.6

[Docker build output...]
✅ Backend image built

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔨 Building Frontend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Version: v1.0.6

[Docker build output...]
✅ Frontend image built

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⬆️  Pushing Images to ECR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pushing: movienight-backend-v1.0.6
Pushing: movienight-backend-latest
Pushing: movienight-frontend-v1.0.6
Pushing: movienight-frontend-latest

╔════════════════════════════════════════╗
║  ✅ All images pushed successfully!    ║
╚════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Application: MovieNight
📦 ECR Repository: int-production-use1-ecs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pushed images:
  • movienight-backend-v1.0.6
  • movienight-backend-latest
  • movienight-frontend-v1.0.6
  • movienight-frontend-latest
```

## 🔁 Typical Workflow

### Development Cycle

1. **Make Code Changes**
   ```bash
   cd MovieNight/backend
   # Edit your code...
   ```

2. **Build & Push**
   ```bash
   cd ../../ecr
   ./build-and-push.sh
   # Select app: MovieNight
   # Select repo: int-production-use1-ecs
   ```

3. **Deploy**
   - GitHub Actions workflow (automatically uses latest tags)
   - Manual kubectl/helm deployment
   - Container orchestration platform

## 🆚 vs App-Specific Scripts

### This Tool (Recommended)
✅ Single location for all apps  
✅ Scan and discover apps automatically  
✅ Choose app and ECR repo interactively  
✅ Consistent versioning across all apps  
✅ Easy to maintain  

### App-Specific Scripts
❌ Duplicate scripts in each app folder  
❌ Hardcoded repository names  
❌ Gets buried in app directories  
❌ Harder to maintain consistency  

## 🐛 Troubleshooting

### "No applications found"
Check that your apps have:
- `backend/` or `frontend/` folders with Dockerfiles
- OR a `Dockerfile` at the app root

### "Failed to get AWS Account ID"
```bash
aws configure
# Or
export AWS_PROFILE=your-profile
```

### "Docker is not running"
Start Docker Desktop or Docker daemon

### "No ECR repositories found"
Create one:
```bash
aws ecr create-repository --repository-name my-repo --region us-east-1
```

### "Build failed"
- Check Dockerfile syntax in the app's directory
- Ensure all dependencies are available
- Check Docker logs for specific errors

## 📝 Manual ECR Commands

### List images in a repository
```bash
aws ecr list-images --repository-name int-production-use1-ecs --region us-east-1
```

### View detailed image info
```bash
aws ecr describe-images --repository-name int-production-use1-ecs --region us-east-1
```

### Delete an image tag
```bash
aws ecr batch-delete-image \
  --repository-name int-production-use1-ecs \
  --image-ids imageTag=movienight-backend-v1.0.1 \
  --region us-east-1
```

### List all ECR repositories
```bash
aws ecr describe-repositories --region us-east-1
```

## 🚦 Best Practices

1. **Use Latest Tags for Deployments**: Your workflows should reference `-latest` tags
2. **Keep Versioned Tags**: They provide history and rollback capability
3. **Test Before Pushing**: Validate locally before running the script
4. **Document Changes**: Use git commit messages to track what each version contains
5. **Regular Cleanup**: Old unused versions can be deleted to save storage costs

## 📚 Additional Resources

- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [Docker Build Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS CLI ECR Commands](https://docs.aws.amazon.com/cli/latest/reference/ecr/)
