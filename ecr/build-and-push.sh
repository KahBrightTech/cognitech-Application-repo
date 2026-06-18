#!/bin/bash

# Multi-App ECR Build and Push Script
# Scans all apps in the repo and pushes to selected ECR repository

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🐳 Multi-App ECR Build & Push Tool   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Get script directory and navigate to repo root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.." || exit 1
REPO_ROOT=$(pwd)

echo -e "${CYAN}📁 Repository: ${REPO_ROOT}${NC}"
echo ""

# Scan for apps (folders with backend/frontend or Dockerfile)
echo -e "${BLUE}🔍 Scanning for applications...${NC}"

APPS=()
for dir in */ ; do
    dir_name="${dir%/}"
    
    # Skip common non-app directories
    if [[ "$dir_name" == "node_modules" || "$dir_name" == ".git" || "$dir_name" == "ecr" || "$dir_name" == ".github" ]]; then
        continue
    fi
    
    # Check if it has backend/frontend folders or Dockerfile
    if [[ -d "$dir_name/backend" ]] || [[ -d "$dir_name/frontend" ]] || [[ -f "$dir_name/Dockerfile" ]] || [[ -f "$dir_name/docker-compose.yml" ]]; then
        APPS+=("$dir_name")
    fi
done

if [ ${#APPS[@]} -eq 0 ]; then
    echo -e "${RED}❌ No applications found in repository${NC}"
    exit 1
fi

echo -e "${GREEN}Found ${#APPS[@]} applications:${NC}"
echo ""

# Display apps with numbers
for i in "${!APPS[@]}"; do
    app="${APPS[$i]}"
    components=""
    
    # Detect components
    if [[ -d "$app/backend" ]] && [[ -d "$app/frontend" ]]; then
        components="(backend + frontend)"
    elif [[ -d "$app/backend" ]]; then
        components="(backend only)"
    elif [[ -d "$app/frontend" ]]; then
        components="(frontend only)"
    elif [[ -f "$app/Dockerfile" ]]; then
        components="(single container)"
    fi
    
    echo -e "${CYAN}  $((i+1)). ${app} ${MAGENTA}${components}${NC}"
done

echo ""
echo -e "${YELLOW}Which application do you want to build?${NC}"
read -p "Enter number (1-${#APPS[@]}): " APP_CHOICE

# Validate input
if ! [[ "$APP_CHOICE" =~ ^[0-9]+$ ]] || [ "$APP_CHOICE" -lt 1 ] || [ "$APP_CHOICE" -gt "${#APPS[@]}" ]; then
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

SELECTED_APP="${APPS[$((APP_CHOICE-1))]}"
echo ""
echo -e "${GREEN}✅ Selected application: ${SELECTED_APP}${NC}"
echo ""

# Get AWS Region
AWS_REGION="${AWS_REGION:-us-east-1}"
echo -e "${CYAN}🌍 Using AWS Region: ${AWS_REGION}${NC}"
echo ""

# Get AWS Account ID
echo -e "${BLUE}🔍 Getting AWS Account ID...${NC}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to get AWS Account ID. Are you authenticated?${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"
echo ""

# List all ECR repositories
echo -e "${BLUE}📦 Fetching ECR repositories...${NC}"
REPOS=$(aws ecr describe-repositories --region ${AWS_REGION} --query 'repositories[*].repositoryName' --output text 2>/dev/null)

if [ $? -ne 0 ] || [ -z "$REPOS" ]; then
    echo -e "${RED}❌ Failed to fetch ECR repositories or no repositories found${NC}"
    exit 1
fi

# Convert to array
REPO_ARRAY=($REPOS)
REPO_COUNT=${#REPO_ARRAY[@]}

echo -e "${GREEN}Found ${REPO_COUNT} ECR repositories:${NC}"
echo ""

# Display repositories with numbers
for i in "${!REPO_ARRAY[@]}"; do
    echo -e "${CYAN}  $((i+1)). ${REPO_ARRAY[$i]}${NC}"
done

echo ""
echo -e "${YELLOW}Which repository do you want to push to?${NC}"
read -p "Enter number (1-${REPO_COUNT}): " REPO_CHOICE

# Validate input
if ! [[ "$REPO_CHOICE" =~ ^[0-9]+$ ]] || [ "$REPO_CHOICE" -lt 1 ] || [ "$REPO_CHOICE" -gt "$REPO_COUNT" ]; then
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

# Get selected repository
ECR_REPOSITORY="${REPO_ARRAY[$((REPO_CHOICE-1))]}"
echo ""
echo -e "${GREEN}✅ Selected repository: ${ECR_REPOSITORY}${NC}"
echo ""

# Login to ECR
echo -e "${BLUE}🔐 Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to login to ECR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Logged in to ECR${NC}"
echo ""

# Normalize app name for tagging (lowercase, replace spaces/special chars)
APP_NAME_TAG=$(echo "${SELECTED_APP}" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]-')

# Function to get and increment version for a component
get_next_version() {
    local component_tag=$1
    
    VERSIONS=$(aws ecr describe-images \
      --repository-name ${ECR_REPOSITORY} \
      --region ${AWS_REGION} \
      --query 'imageDetails[*].imageTags[]' \
      --output text 2>/dev/null | tr '\t' '\n' | grep -E "^${component_tag}-v[0-9]+\.[0-9]+\.[0-9]+$" | sed "s/${component_tag}-v//" || echo "")
    
    if [ -z "$VERSIONS" ]; then
      echo "v1.0.0"
    else
      LATEST_VERSION=$(echo "$VERSIONS" | sort -V | tail -n 1)
      MAJOR=$(echo $LATEST_VERSION | cut -d. -f1)
      MINOR=$(echo $LATEST_VERSION | cut -d. -f2)
      PATCH=$(echo $LATEST_VERSION | cut -d. -f3)
      NEW_PATCH=$((PATCH + 1))
      echo "v${MAJOR}.${MINOR}.${NEW_PATCH}"
    fi
}

# Detect and build components
cd "${SELECTED_APP}" || exit 1

BUILT_IMAGES=()

# Check for backend
if [[ -d "backend" ]] && [[ -f "backend/Dockerfile" ]]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🔨 Building Backend${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    COMPONENT_TAG="${APP_NAME_TAG}-backend"
    VERSION=$(get_next_version "${COMPONENT_TAG}")
    
    echo -e "${GREEN}📌 Version: ${VERSION}${NC}"
    echo ""
    
    cd backend
    docker build -t ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${COMPONENT_TAG}-${VERSION} .
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Backend build failed${NC}"
        exit 1
    fi
    
    docker tag ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${COMPONENT_TAG}-${VERSION} \
      ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${COMPONENT_TAG}-latest
    
    echo -e "${GREEN}✅ Backend image built${NC}"
    cd ..
    
    BUILT_IMAGES+=("${COMPONENT_TAG}-${VERSION}" "${COMPONENT_TAG}-latest")
fi

# Check for frontend
if [[ -d "frontend" ]] && [[ -f "frontend/Dockerfile" ]]; then
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🔨 Building Frontend${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    COMPONENT_TAG="${APP_NAME_TAG}-frontend"
    VERSION=$(get_next_version "${COMPONENT_TAG}")
    
    echo -e "${GREEN}📌 Version: ${VERSION}${NC}"
    echo ""
    
    cd frontend
    docker build -t ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${COMPONENT_TAG}-${VERSION} .
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Frontend build failed${NC}"
        exit 1
    fi
    
    docker tag ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${COMPONENT_TAG}-${VERSION} \
      ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${COMPONENT_TAG}-latest
    
    echo -e "${GREEN}✅ Frontend image built${NC}"
    cd ..
    
    BUILT_IMAGES+=("${COMPONENT_TAG}-${VERSION}" "${COMPONENT_TAG}-latest")
fi

# Check for single Dockerfile at app root
if [[ -f "Dockerfile" ]] && [[ ! -d "backend" ]] && [[ ! -d "frontend" ]]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🔨 Building Application${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    COMPONENT_TAG="${APP_NAME_TAG}"
    VERSION=$(get_next_version "${COMPONENT_TAG}")
    
    echo -e "${GREEN}📌 Version: ${VERSION}${NC}"
    echo ""
    
    docker build -t ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${COMPONENT_TAG}-${VERSION} .
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
    
    docker tag ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${COMPONENT_TAG}-${VERSION} \
      ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${COMPONENT_TAG}-latest
    
    echo -e "${GREEN}✅ Image built${NC}"
    
    BUILT_IMAGES+=("${COMPONENT_TAG}-${VERSION}" "${COMPONENT_TAG}-latest")
fi

# Check if any images were built
if [ ${#BUILT_IMAGES[@]} -eq 0 ]; then
    echo -e "${RED}❌ No Dockerfiles found in ${SELECTED_APP}${NC}"
    exit 1
fi

# Push images to ECR
cd "$REPO_ROOT" || exit 1

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⬆️  Pushing Images to ECR${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

for image_tag in "${BUILT_IMAGES[@]}"; do
    echo -e "${CYAN}Pushing: ${image_tag}${NC}"
    docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${image_tag}
    echo ""
done

# Summary
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ All images pushed successfully!    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📦 Application: ${SELECTED_APP}${NC}"
echo -e "${CYAN}📦 ECR Repository: ${ECR_REPOSITORY}${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Pushed images:${NC}"
for image_tag in "${BUILT_IMAGES[@]}"; do
    echo -e "  • ${image_tag}"
done
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "  1. Go to GitHub Actions (if using workflow deployment)"
echo "  2. Or use kubectl/helm to deploy with these image tags"
echo "  3. The 'latest' tags always point to the newest version"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
