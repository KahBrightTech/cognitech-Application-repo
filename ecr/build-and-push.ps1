# Multi-App ECR Build and Push Script (PowerShell)
# Scans all apps in the repo and pushes to selected ECR repository

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  🐳 Multi-App ECR Build & Push Tool   ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Check if AWS CLI is installed
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI is not installed" -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running" -ForegroundColor Red
    exit 1
}

# Get script directory and navigate to repo root
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\.."
$REPO_ROOT = Get-Location

Write-Host "📁 Repository: $REPO_ROOT" -ForegroundColor Cyan
Write-Host ""

# Scan for apps (folders with backend/frontend or Dockerfile)
Write-Host "🔍 Scanning for applications..." -ForegroundColor Blue

$APPS = @()
Get-ChildItem -Directory | ForEach-Object {
    $dirName = $_.Name
    
    # Skip common non-app directories
    if ($dirName -in @("node_modules", ".git", "ecr", ".github")) {
        return
    }
    
    # Check if it has backend/frontend folders or Dockerfile
    if ((Test-Path "$dirName\backend") -or (Test-Path "$dirName\frontend") -or 
        (Test-Path "$dirName\Dockerfile") -or (Test-Path "$dirName\docker-compose.yml")) {
        $APPS += $dirName
    }
}

if ($APPS.Count -eq 0) {
    Write-Host "❌ No applications found in repository" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($APPS.Count) applications:" -ForegroundColor Green
Write-Host ""

# Display apps with numbers
for ($i = 0; $i -lt $APPS.Count; $i++) {
    $app = $APPS[$i]
    $components = ""
    
    # Detect components
    if ((Test-Path "$app\backend") -and (Test-Path "$app\frontend")) {
        $components = "(backend + frontend)"
    } elseif (Test-Path "$app\backend") {
        $components = "(backend only)"
    } elseif (Test-Path "$app\frontend") {
        $components = "(frontend only)"
    } elseif (Test-Path "$app\Dockerfile") {
        $components = "(single container)"
    }
    
    Write-Host "  $($i+1). $app " -NoNewline -ForegroundColor Cyan
    Write-Host $components -ForegroundColor Magenta
}

Write-Host ""
Write-Host "Which application do you want to build?" -ForegroundColor Yellow
$APP_CHOICE = Read-Host "Enter number (1-$($APPS.Count))"

# Validate input
if (-not ($APP_CHOICE -match '^\d+$') -or [int]$APP_CHOICE -lt 1 -or [int]$APP_CHOICE -gt $APPS.Count) {
    Write-Host "❌ Invalid choice" -ForegroundColor Red
    exit 1
}

$SELECTED_APP = $APPS[[int]$APP_CHOICE - 1]
Write-Host ""
Write-Host "✅ Selected application: $SELECTED_APP" -ForegroundColor Green
Write-Host ""

# Get AWS Region
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }
Write-Host "🌍 Using AWS Region: $AWS_REGION" -ForegroundColor Cyan
Write-Host ""

# Get AWS Account ID
Write-Host "🔍 Getting AWS Account ID..." -ForegroundColor Blue
try {
    $AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
    Write-Host "✅ AWS Account ID: $AWS_ACCOUNT_ID" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get AWS Account ID. Are you authenticated?" -ForegroundColor Red
    exit 1
}

# List all ECR repositories
Write-Host "📦 Fetching ECR repositories..." -ForegroundColor Blue
try {
    $REPOS = aws ecr describe-repositories --region $AWS_REGION --query 'repositories[*].repositoryName' --output json | ConvertFrom-Json
    
    if ($REPOS.Count -eq 0) {
        Write-Host "❌ No ECR repositories found" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Found $($REPOS.Count) ECR repositories:" -ForegroundColor Green
    Write-Host ""
    
    # Display repositories with numbers
    for ($i = 0; $i -lt $REPOS.Count; $i++) {
        Write-Host "  $($i+1). $($REPOS[$i])" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "Which repository do you want to push to?" -ForegroundColor Yellow
    $REPO_CHOICE = Read-Host "Enter number (1-$($REPOS.Count))"
    
    # Validate input
    if (-not ($REPO_CHOICE -match '^\d+$') -or [int]$REPO_CHOICE -lt 1 -or [int]$REPO_CHOICE -gt $REPOS.Count) {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
    
    $ECR_REPOSITORY = $REPOS[[int]$REPO_CHOICE - 1]
    Write-Host ""
    Write-Host "✅ Selected repository: $ECR_REPOSITORY" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "❌ Failed to fetch ECR repositories" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Login to ECR
Write-Host "🔐 Logging in to Amazon ECR..." -ForegroundColor Blue
try {
    $password = aws ecr get-login-password --region $AWS_REGION
    $password | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    Write-Host "✅ Logged in to ECR" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Failed to login to ECR" -ForegroundColor Red
    exit 1
}

# Normalize app name for tagging (lowercase, replace spaces/special chars)
$APP_NAME_TAG = $SELECTED_APP.ToLower() -replace '[^a-z0-9\-]', ''

# Function to get and increment version for a component
function Get-NextVersion {
    param([string]$componentTag)
    
    try {
        $imageDetails = aws ecr describe-images --repository-name $ECR_REPOSITORY --region $AWS_REGION --query 'imageDetails[*].imageTags[]' --output json 2>$null | ConvertFrom-Json
        $versions = $imageDetails | Where-Object { $_ -match "^$componentTag-v[0-9]+\.[0-9]+\.[0-9]+$" } | ForEach-Object { $_ -replace "$componentTag-v", '' }
        
        if ($versions.Count -eq 0) {
            return "v1.0.0"
        } else {
            $LATEST_VERSION = ($versions | Sort-Object { [version]$_ } | Select-Object -Last 1)
            $versionParts = $LATEST_VERSION.Split('.')
            $MAJOR = [int]$versionParts[0]
            $MINOR = [int]$versionParts[1]
            $PATCH = [int]$versionParts[2]
            $NEW_PATCH = $PATCH + 1
            return "v$MAJOR.$MINOR.$NEW_PATCH"
        }
    } catch {
        return "v1.0.0"
    }
}

# Detect and build components
Set-Location $SELECTED_APP

$BUILT_IMAGES = @()

# Check for backend
if ((Test-Path "backend") -and (Test-Path "backend\Dockerfile")) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "🔨 Building Backend" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    
    $COMPONENT_TAG = "$APP_NAME_TAG-backend"
    $VERSION = Get-NextVersion $COMPONENT_TAG
    
    Write-Host "📌 Version: $VERSION" -ForegroundColor Green
    Write-Host ""
    
    Set-Location backend
    docker build -t "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY`:$COMPONENT_TAG-$VERSION" .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend build failed" -ForegroundColor Red
        exit 1
    }
    
    docker tag "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY`:$COMPONENT_TAG-$VERSION" `
      "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY`:$COMPONENT_TAG-latest"
    
    Write-Host "✅ Backend image built" -ForegroundColor Green
    Set-Location ..
    
    $BUILT_IMAGES += "$COMPONENT_TAG-$VERSION"
    $BUILT_IMAGES += "$COMPONENT_TAG-latest"
}

# Check for frontend
if ((Test-Path "frontend") -and (Test-Path "frontend\Dockerfile")) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "🔨 Building Frontend" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    
    $COMPONENT_TAG = "$APP_NAME_TAG-frontend"
    $VERSION = Get-NextVersion $COMPONENT_TAG
    
    Write-Host "📌 Version: $VERSION" -ForegroundColor Green
    Write-Host ""
    
    Set-Location frontend
    docker build -t "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY`:$COMPONENT_TAG-$VERSION" .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        exit 1
    }
    
    docker tag "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY`:$COMPONENT_TAG-$VERSION" `
      "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY`:$COMPONENT_TAG-latest"
    
    Write-Host "✅ Frontend image built" -ForegroundColor Green
    Set-Location ..
    
    $BUILT_IMAGES += "$COMPONENT_TAG-$VERSION"
    $BUILT_IMAGES += "$COMPONENT_TAG-latest"
}

# Check for single Dockerfile at app root
if ((Test-Path "Dockerfile") -and -not (Test-Path "backend") -and -not (Test-Path "frontend")) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "🔨 Building Application" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    
    $COMPONENT_TAG = $APP_NAME_TAG
    $VERSION = Get-NextVersion $COMPONENT_TAG
    
    Write-Host "📌 Version: $VERSION" -ForegroundColor Green
    Write-Host ""
    
    docker build -t "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY`:$COMPONENT_TAG-$VERSION" .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
    
    docker tag "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY`:$COMPONENT_TAG-$VERSION" `
      "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY`:$COMPONENT_TAG-latest"
    
    Write-Host "✅ Image built" -ForegroundColor Green
    
    $BUILT_IMAGES += "$COMPONENT_TAG-$VERSION"
    $BUILT_IMAGES += "$COMPONENT_TAG-latest"
}

# Check if any images were built
if ($BUILT_IMAGES.Count -eq 0) {
    Write-Host "❌ No Dockerfiles found in $SELECTED_APP" -ForegroundColor Red
    exit 1
}

# Push images to ECR
Set-Location $REPO_ROOT

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "⬆️  Pushing Images to ECR" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

foreach ($imageTag in $BUILT_IMAGES) {
    Write-Host "Pushing: $imageTag" -ForegroundColor Cyan
    docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY`:$imageTag"
    Write-Host ""
}

# Summary
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ All images pushed successfully!    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📦 Application: $SELECTED_APP" -ForegroundColor Cyan
Write-Host "📦 ECR Repository: $ECR_REPOSITORY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pushed images:" -ForegroundColor Green
foreach ($imageTag in $BUILT_IMAGES) {
    Write-Host "  • $imageTag"
}
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 Next Steps:" -ForegroundColor Blue
Write-Host "  1. Go to GitHub Actions (if using workflow deployment)"
Write-Host "  2. Or use kubectl/helm to deploy with these image tags"
Write-Host "  3. The 'latest' tags always point to the newest version"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
