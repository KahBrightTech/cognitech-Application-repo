# 🧹 ECR Image Cleanup Guide

Quick guide to clean up old/unnecessary images from ECR.

---

## 🔍 Why So Many Images?

You saw many images because:

1. **Multi-architecture builds** create multiple manifests per tag:
   - Image Index (manifest list)
   - linux/amd64 image
   - linux/arm64 image  
   - Attestation manifests (0.02 MB entries)

2. **Old tagging strategy** used both SHA + latest = 2x manifests per build

3. **New strategy** uses only version + latest = cleaner ECR

---

## 🗑️ Clean Up Old Images

### Option 1: Delete All Old SHA-based Images (Recommended)

```powershell
# List all SHA-based tags (old system)
aws ecr describe-images `
  --repository-name int-production-use1-ecs `
  --region us-east-1 `
  --query 'imageDetails[?starts_with(imageTags[0], `movienight-`) && contains(imageTags[0], `-f9e630`)]' `
  --output table

# Delete SHA-based images (be careful!)
$OLD_TAGS = aws ecr describe-images `
  --repository-name int-production-use1-ecs `
  --region us-east-1 `
  --query 'imageDetails[?starts_with(imageTags[0], `movienight-`)].imageTags[]' `
  --output text | Where-Object { $_ -match '-[a-f0-9]{40}$' }

foreach ($tag in $OLD_TAGS) {
  Write-Host "Deleting: $tag"
  aws ecr batch-delete-image `
    --repository-name int-production-use1-ecs `
    --region us-east-1 `
    --image-ids imageTag=$tag
}
```

### Option 2: Keep Only Latest N Versions

```powershell
# Keep only the latest 10 versions per environment
# This script keeps the 10 most recent versions and deletes the rest

function Remove-OldVersions {
  param(
    [string]$Prefix,  # e.g., "movienight-backend-dev-v"
    [int]$KeepCount = 10
  )
  
  Write-Host "Processing $Prefix..." -ForegroundColor Cyan
  
  # Get all version tags
  $versions = aws ecr describe-images `
    --repository-name int-production-use1-ecs `
    --region us-east-1 `
    --query "imageDetails[?starts_with(imageTags[0], '$Prefix')].{tag:imageTags[0],date:imagePushedAt}" `
    --output json | ConvertFrom-Json
  
  # Sort by date (newest first) and skip the ones to keep
  $toDelete = $versions | Sort-Object -Property date -Descending | Select-Object -Skip $KeepCount
  
  foreach ($image in $toDelete) {
    Write-Host "  Deleting: $($image.tag)" -ForegroundColor Yellow
    aws ecr batch-delete-image `
      --repository-name int-production-use1-ecs `
      --region us-east-1 `
      --image-ids imageTag=$($image.tag)
  }
  
  Write-Host "  Kept $KeepCount versions, deleted $($toDelete.Count) old versions" -ForegroundColor Green
}

# Clean up each component
Remove-OldVersions -Prefix "movienight-backend-dev-v" -KeepCount 5
Remove-OldVersions -Prefix "movienight-frontend-dev-v" -KeepCount 5
Remove-OldVersions -Prefix "movienight-backend-staging-v" -KeepCount 5
Remove-OldVersions -Prefix "movienight-frontend-staging-v" -KeepCount 5
Remove-OldVersions -Prefix "movienight-backend-v" -KeepCount 10
Remove-OldVersions -Prefix "movienight-frontend-v" -KeepCount 10
```

### Option 3: Set Up Lifecycle Policy (Automated)

Create a lifecycle policy to automatically delete old images:

```powershell
# Create lifecycle policy JSON
@"
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep only latest 10 dev versions",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["movienight-backend-dev-v", "movienight-frontend-dev-v"],
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 2,
      "description": "Keep only latest 10 staging versions",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["movienight-backend-staging-v", "movienight-frontend-staging-v"],
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 3,
      "description": "Keep only latest 20 production versions",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["movienight-backend-v", "movienight-frontend-v"],
        "countType": "imageCountMoreThan",
        "countNumber": 20
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 4,
      "description": "Delete untagged images after 7 days",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 7
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
"@ | Out-File -FilePath lifecycle-policy.json -Encoding utf8

# Apply lifecycle policy
aws ecr put-lifecycle-policy `
  --repository-name int-production-use1-ecs `
  --region us-east-1 `
  --lifecycle-policy-text file://lifecycle-policy.json

Write-Host "✅ Lifecycle policy applied!" -ForegroundColor Green
Write-Host "ECR will now automatically clean up old images" -ForegroundColor Cyan
```

---

## 📊 Check Your Images

### List all MovieNight images

```powershell
# Count images by prefix
aws ecr describe-images `
  --repository-name int-production-use1-ecs `
  --region us-east-1 `
  --query 'imageDetails[?starts_with(imageTags[0], `movienight-`)].imageTags[0]' `
  --output table | Measure-Object

# Group by component
$images = aws ecr describe-images `
  --repository-name int-production-use1-ecs `
  --region us-east-1 `
  --query 'imageDetails[?starts_with(imageTags[0], `movienight-`)].{tag:imageTags[0],size:imageSizeInBytes,date:imagePushedAt}' `
  --output json | ConvertFrom-Json

Write-Host "`nImage Summary:" -ForegroundColor Cyan
Write-Host "============================================"
$images | Group-Object { $_.tag -replace '-v.*$', '' } | ForEach-Object {
  Write-Host "$($_.Name): $($_.Count) images" -ForegroundColor Yellow
}

$totalSize = ($images | Measure-Object -Property size -Sum).Sum / 1MB
Write-Host "`nTotal Size: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Green
```

### List only version-tagged images (new system)

```powershell
aws ecr describe-images `
  --repository-name int-production-use1-ecs `
  --region us-east-1 `
  --query 'imageDetails[?contains(imageTags[0], `-v`) && starts_with(imageTags[0], `movienight-`)].{Tag:imageTags[0],Size:imageSizeInBytes,Date:imagePushedAt}' `
  --output table
```

---

## 🎯 New Tagging System

After cleanup, you'll only have:

### Development
```
movienight-backend-dev-v1.0.0
movienight-backend-dev-v1.0.1
movienight-backend-dev-v1.0.2
movienight-backend-dev-latest    ← Always points to v1.0.2
```

### Staging
```
movienight-backend-staging-v1.0.0
movienight-backend-staging-v1.0.1
movienight-backend-staging-latest  ← Always points to v1.0.1
```

### Production
```
movienight-backend-v1.0.0
movienight-backend-v1.0.1
movienight-backend-v1.1.0
movienight-backend-latest          ← Always points to v1.1.0
```

**Result:** Only 2 tags per build instead of many SHA-based tags!

---

## 🔐 Safe Cleanup Procedure

1. **Backup current deployments** first:
```powershell
helm list -A > helm-releases-backup.txt
kubectl get pods -A -o wide > pods-backup.txt
```

2. **Identify images in use**:
```powershell
# Check what's running in dev
kubectl get pods -n movienight-dev -o jsonpath='{.items[*].spec.containers[*].image}' | tr ' ' '\n'

# Check what's running in staging
kubectl get pods -n movienight-staging -o jsonpath='{.items[*].spec.containers[*].image}' | tr ' ' '\n'

# Check what's running in production
kubectl get pods -n movienight -o jsonpath='{.items[*].spec.containers[*].image}' | tr ' ' '\n'
```

3. **Delete old SHA-based images** (not in use):
```powershell
# Only delete images with SHA hashes
# DO NOT delete version-tagged images (v1.0.0, etc.)
# DO NOT delete currently running images
```

4. **Verify cleanup**:
```powershell
aws ecr describe-images `
  --repository-name int-production-use1-ecs `
  --region us-east-1 `
  --query 'length(imageDetails[?starts_with(imageTags[0], `movienight-`)])'
```

---

## 💰 Cost Savings

ECR charges $0.10 per GB-month. With cleaner images:

**Before (with SHA tags):**
- ~100 images × 50 MB average = 5 GB = **$0.50/month**

**After (version tags only):**
- ~20 images × 50 MB average = 1 GB = **$0.10/month**

**Savings:** 80% reduction in storage costs! 🎉

---

## 🆘 Emergency Restore

If you accidentally delete the wrong image:

```powershell
# Images can't be restored once deleted!
# But you can rebuild from git commit:

# Find the commit
git log --oneline

# Checkout that commit
git checkout <commit-sha>

# Rebuild and push
docker build -t <account>.dkr.ecr.us-east-1.amazonaws.com/int-production-use1-ecs:movienight-backend-v1.0.5 ./MovieNight/backend
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/int-production-use1-ecs:movienight-backend-v1.0.5
```

---

## 📝 Best Practices

✅ **Always keep `latest` tags** - they point to most recent version  
✅ **Keep at least 5-10 recent versions** - for rollback  
✅ **Set up lifecycle policies** - automatic cleanup  
✅ **Delete SHA-based tags** - old system, not needed  
✅ **Verify running images** before deleting  
❌ **Don't delete images in use** - will break deployments  
❌ **Don't delete all versions** - keep rollback options  

---

**Ready to clean up? Start with the lifecycle policy! 🧹**
