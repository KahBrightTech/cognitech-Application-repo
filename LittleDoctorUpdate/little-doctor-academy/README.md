# Little Doctor Academy

A Dockerized, responsive React application that gives children a safe, playful introduction to doctors, patients, medical tools, and basic health concepts.

## Included experience

- Home screen with a guided daily mission
- Doctor, nurse, dentist, veterinarian, and patient characters
- Four interactive lessons:
  - Listen to the heart
  - Check a temperature
  - Treat a scraped knee
  - Explore an X-ray
- Step-by-step activity player
- Knowledge checks and star rewards
- Parent progress dashboard
- Local browser persistence for completed lessons and stars
- Responsive desktop, tablet, and mobile layouts
- Docker and Docker Compose support
- NGINX security headers and `/healthz`
- Production-ready Helm chart for Amazon EKS
- HPA, PodDisruptionBudget, probes, resource limits, security contexts, and NetworkPolicy
- GitHub Actions CI and ECR/EKS release workflow

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Run with Docker

```bash
docker compose up --build
```

Open `http://localhost:8080`.

## Run without Docker for a production preview

```bash
npm install
npm run build
npm run preview
```

## Deploy to Amazon EKS

Prerequisites:

- Existing EKS cluster
- AWS Load Balancer Controller installed
- ECR repository named `little-doctor-academy`
- ACM certificate
- Route 53 DNS record or ExternalDNS
- Metrics Server for HPA
- GitHub OIDC IAM role with ECR and EKS deployment permissions

Update the values:

```bash
helm upgrade --install little-doctor-academy deploy/helm/little-doctor-academy \
  --namespace YOUR_EXISTING_NAMESPACE \
  --set image.repository=ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/little-doctor-academy \
  --set image.tag=1.0.0 \
  --set ingress.host=doctor.example.com \
  --set ingress.certificateArn=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID \
  --atomic
```

## GitHub repository secrets

- `AWS_GITHUB_ACTIONS_ROLE_ARN`
- `EKS_CLUSTER_NAME`
- `K8S_NAMESPACE`
- `APP_HOST`
- `ACM_CERTIFICATE_ARN`

## Architecture path

User → Route 53 → ALB → Kubernetes Service → React/NGINX pods

Images are built in GitHub Actions, stored in Amazon ECR, and deployed to EKS using Helm.

## Production roadmap

This repository is a polished production starter. Before collecting child profiles or launching publicly, add:

1. Parent authentication and verified parental consent.
2. A backend API and database for durable progress storage.
3. COPPA/privacy review, retention controls, deletion workflows, and a privacy policy.
4. Curated narration and subtitles.
5. Professionally reviewed medical education content.
6. Moderated, pre-generated media only—no unrestricted child-facing generative chat.
7. Accessibility testing, analytics consent, monitoring, backups, and incident response.
8. CDN/media delivery using CloudFront and S3 for character art and videos.

## Important

The app is educational and must not diagnose, prescribe, or replace a qualified medical professional.

## 2026-07-15-v3 update

- Added 24 interactive patient scenarios covering nurse, doctor, imaging, pharmacist, parent, and OTC-counter journeys.
- Added a custom parent sign-in/sign-up screen matching the Little Doctor Academy design.
- Added the Medical Match Dash quick-break game with star rewards.
- Added Dr. Priya, Pharmacist Oliver, X-ray Technician Luca, Maya, and Leo.
- Replaced low-resolution character rendering with scalable SVG artwork.
- Added working navigation/actions for login, logout, game, scenario cards, character cards, dashboard, and home controls.

### Authentication note

The included login screen is a functional local demonstration that stores only the demo user name and email in browser localStorage. It does not store the entered password. Before production deployment, connect the form handlers in `src/components/LoginScreen.jsx` to an Amazon Cognito User Pool using Amplify Auth or the Cognito SDK, and validate Cognito JWTs in the EKS backend API.
