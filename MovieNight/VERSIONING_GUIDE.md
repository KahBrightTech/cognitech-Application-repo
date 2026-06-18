# 🏷️ MovieNight Versioning & Tagging Guide

This guide explains the hybrid versioning strategy used across environments.

---

## 📊 Tagging Strategy Overview

### Development Environment
```
Tags: SHA + latest
movienight-backend-dev-abc123f
movienight-backend-dev-latest
```

### Staging Environment
```
Tags: SHA + latest
movienight-backend-staging-abc123f
movienight-backend-staging-latest
```

### Production Environment
```
Tags: Semantic Version + SHA + Version+SHA + latest
movienight-backend-v1.2.0          ← Semantic version (if git tag exists)
movienight-backend-v1.2.0-abc123f  ← Version + SHA (traceability)
movienight-backend-abc123f         ← SHA only
movienight-backend-latest          ← Always latest
```

---

## 🚀 How to Use

### Normal Dev/Staging Deployments (SHA-based)

**Just push to the branch** - automatic SHA tagging:

```powershell
# Development
git push origin develop
# Creates: movienight-backend-dev-{sha}, movienight-backend-dev-latest

# Staging
git push origin staging
# Creates: movienight-backend-staging-{sha}, movienight-backend-staging-latest
```

**No extra steps needed!** SHA tags are automatically created.

---

### Production Deployments

#### Option 1: SHA-Only (Quick Releases)

**When to use:** Hotfixes, rapid iterations, internal releases

```powershell
# Just push to main - creates SHA tags only
git checkout main
git merge staging
git push origin main
```

**Creates:**
- `movienight-backend-abc123f`
- `movienight-backend-latest`

---

#### Option 2: Semantic Version (Official Releases)

**When to use:** Major releases, customer-facing versions, release announcements

```powershell
# 1. Merge to main
git checkout main
git merge staging

# 2. Create a semantic version tag
git tag -a v1.2.0 -m "Release v1.2.0: Added awesome feature"

# 3. Push with tags
git push origin main --tags
```

**Creates:**
- `movienight-backend-v1.2.0` ← Semantic version
- `movienight-backend-v1.2.0-abc123f` ← Version + SHA
- `movienight-backend-abc123f` ← SHA only
- `movienight-backend-latest` ← Latest

---

## 🔢 Semantic Versioning Rules

Use the format: `v{MAJOR}.{MINOR}.{PATCH}`

### When to Bump Version Numbers

**MAJOR (v1.0.0 → v2.0.0)**
- Breaking API changes
- Complete redesigns
- Incompatible changes

**MINOR (v1.0.0 → v1.1.0)**
- New features
- Backwards-compatible enhancements
- New API endpoints

**PATCH (v1.0.0 → v1.0.1)**
- Bug fixes
- Security patches
- Performance improvements

### Examples

```powershell
# First production release
git tag -a v1.0.0 -m "Initial production release"

# Added movie filtering feature
git tag -a v1.1.0 -m "Added genre filtering"

# Fixed WebSocket bug
git tag -a v1.1.1 -m "Fixed WebSocket connection issue"

# Major UI redesign
git tag -a v2.0.0 -m "Complete UI redesign"
```

---

## 📋 Step-by-Step Release Process

### Quick Release (SHA-only)

```powershell
# Test in staging
git checkout staging
git merge develop
git push origin staging

# Deploy to production
git checkout main
git merge staging
git push origin main

# ✅ Done! Uses SHA tags automatically
```

---

### Official Release (with version)

```powershell
# 1. Ensure staging is tested
git checkout staging
git merge develop
git push origin staging
# Run tests, verify everything works

# 2. Update version in your notes/changelog
# Decide: Is this MAJOR, MINOR, or PATCH?

# 3. Merge to main
git checkout main
git merge staging

# 4. Create version tag
git tag -a v1.2.0 -m "Release v1.2.0: Movie recommendations feature"

# 5. Push main with tags
git push origin main --tags

# ✅ Done! Workflow detects tag and creates all versions
```

---

## 🔍 How to Check Which Tags Were Created

### View Tags in Git

```powershell
# List all tags
git tag

# List tags with messages
git tag -l -n1

# Show latest tag
git describe --tags --abbrev=0

# Show tags pointing to current commit
git tag --points-at HEAD
```

### View Images in ECR

```powershell
# List all backend images
aws ecr describe-images \
  --repository-name int-production-use1-ecs \
  --query 'imageDetails[?starts_with(imageTags[0], `movienight-backend`)]' \
  --output table

# List images with specific version
aws ecr describe-images \
  --repository-name int-production-use1-ecs \
  --image-ids imageTag=movienight-backend-v1.2.0
```

---

## 🎯 Which Approach to Use?

### Use SHA-only tags for:
✅ Daily development  
✅ Hotfixes  
✅ Quick iterations  
✅ Internal testing  
✅ When you track by commits  

### Use Semantic versions for:
✅ Major releases  
✅ Customer announcements  
✅ Production milestones  
✅ Release notes  
✅ When communicating with stakeholders  

---

## 🔄 Rolling Back

### Rollback to Previous Release

```powershell
# Rollback using Helm
helm rollback movienight -n movienight

# Rollback to specific revision
helm rollback movienight 5 -n movienight
```

### Deploy Specific Version

```powershell
# Deploy specific semantic version
helm upgrade --install movienight ./MovieNight/helm/movienight \
  --namespace movienight \
  --values ./MovieNight/helm/movienight/values-prod.yaml \
  --set backend.image.tag=movienight-backend-v1.1.0 \
  --set frontend.image.tag=movienight-frontend-v1.1.0

# Deploy specific SHA
helm upgrade --install movienight ./MovieNight/helm/movienight \
  --namespace movienight \
  --values ./MovieNight/helm/movienight/values-prod.yaml \
  --set backend.image.tag=movienight-backend-abc123f \
  --set frontend.image.tag=movienight-frontend-abc123f
```

---

## 📝 Tag Naming Conventions

### Git Tags
```
✅ v1.0.0        - Correct
✅ v1.2.3        - Correct
✅ v2.0.0-beta   - Correct (pre-release)
❌ 1.0.0         - Missing 'v' prefix
❌ v1.0          - Must have 3 numbers
❌ version-1.0.0 - Wrong format
```

### Image Tags (Auto-generated)
```
Development:
  movienight-backend-dev-{sha}
  movienight-backend-dev-latest

Staging:
  movienight-backend-staging-{sha}
  movienight-backend-staging-latest

Production (with version tag):
  movienight-backend-v1.2.0
  movienight-backend-v1.2.0-{sha}
  movienight-backend-{sha}
  movienight-backend-latest

Production (without version tag):
  movienight-backend-{sha}
  movienight-backend-latest
```

---

## 🛠️ Useful Commands

```powershell
# Create annotated tag
git tag -a v1.2.0 -m "Release message"

# Push tags to remote
git push --tags

# Delete local tag
git tag -d v1.2.0

# Delete remote tag
git push origin :refs/tags/v1.2.0

# View tag details
git show v1.2.0

# List all production image tags
aws ecr list-images --repository-name int-production-use1-ecs \
  --query 'imageIds[?imageTag!=`null`]' --output table

# Check which version is deployed
helm list -n movienight
kubectl get pods -n movienight -o jsonpath='{.items[0].spec.containers[0].image}'
```

---

## 📊 Example Release Timeline

```
v1.0.0 (Jan 1)  → Initial release
  ├─ abc123f    → Hotfix deployment (Jan 5)
  ├─ def456f    → Another fix (Jan 8)
  
v1.1.0 (Jan 15) → Genre filtering feature
  ├─ ghi789f    → Bug fix (Jan 18)
  
v1.1.1 (Jan 20) → WebSocket fix
  
v1.2.0 (Feb 1)  → Movie recommendations
  ├─ jkl012f    → Performance tweak (Feb 3)
  
v2.0.0 (Mar 1)  → Complete redesign
```

---

## 🎓 Quick Reference

| Environment | Tagging Method | Example Tags |
|------------|----------------|--------------|
| **Dev** | SHA + latest | `dev-abc123f`, `dev-latest` |
| **Staging** | SHA + latest | `staging-abc123f`, `staging-latest` |
| **Production (normal)** | SHA + latest | `abc123f`, `latest` |
| **Production (release)** | Version + SHA + latest | `v1.2.0`, `v1.2.0-abc123f`, `abc123f`, `latest` |

---

## 💡 Pro Tips

1. **Always test in staging** before creating production version tags
2. **Use annotated tags** (`-a` flag) for better Git history
3. **Write meaningful tag messages** - they appear in release notes
4. **Keep semantic versions consistent** - don't skip numbers
5. **Tag after successful staging** - ensures code is tested
6. **Use pre-release tags for testing** - e.g., `v1.2.0-beta`

---

## 🆘 Troubleshooting

**Tag not detected by workflow?**
```powershell
# Make sure you pushed the tags
git push --tags

# Check tags point to current commit
git tag --points-at HEAD
```

**Wrong version deployed?**
```powershell
# Check what Helm is using
helm get values movienight -n movienight

# Verify image tags in pods
kubectl get pods -n movienight -o yaml | grep image:
```

**Need to change a tag?**
```powershell
# Delete and recreate
git tag -d v1.2.0
git tag -a v1.2.0 -m "Corrected tag"
git push origin :refs/tags/v1.2.0  # Delete remote
git push --tags                     # Push new tag
```

---

**Happy versioning! 🚀**
