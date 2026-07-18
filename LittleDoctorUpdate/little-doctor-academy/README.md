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
cp .env.example .env   # fill in VITE_COGNITO_* (see "Authentication" below)
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

Update the values (fill in the `cognito.*` values from `terraform output` in `deploy/terraform/cognito`, or swap them for `--set cognito.existingSecret=your-secret-name` if you manage that Secret separately):

```bash
helm upgrade --install little-doctor-academy deploy/helm/little-doctor-academy \
  --namespace YOUR_EXISTING_NAMESPACE \
  --set image.repository=ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/little-doctor-academy \
  --set image.tag=1.0.0 \
  --set ingress.host=doctor.example.com \
  --set ingress.certificateArn=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID \
  --set cognito.userPoolId=us-east-1_XXXXXXXXX \
  --set cognito.clientId=XXXXXXXXXXXXXXXXXXXXXXXXXX \
  --set cognito.region=us-east-1 \
  --atomic
```

## GitHub repository secrets

- `AWS_GITHUB_ACTIONS_ROLE_ARN`
- `EKS_CLUSTER_NAME`
- `K8S_NAMESPACE`
- `APP_HOST`
- `ACM_CERTIFICATE_ARN`
- No Cognito secret is needed here - it's supplied per-environment via the Helm `cognito.*` values / `cognito.existingSecret` at deploy time, not baked into the image build (see "Authentication" below).

## Architecture path

User → Route 53 → ALB → Kubernetes Service → React/NGINX pods

Images are built in GitHub Actions, stored in Amazon ECR, and deployed to EKS using Helm.

## Production roadmap

This repository is a polished production starter. Before collecting child profiles or launching publicly, add:

1. ~~Parent authentication~~ (done via Cognito - see "Authentication" below). Verified parental consent (COPPA) is still outstanding.
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

### Authentication

Parent/guardian sign-in is backed by a real Amazon Cognito User Pool (via `amazon-cognito-identity-js`), not a local demo. `src/components/LoginScreen.jsx` handles sign-up, email verification codes, sign-in (SRP - the password itself is never sent over the wire), and forgot/reset password, all implemented in `src/auth/cognito.js`. Cognito issues the session; nothing sensitive is written to `localStorage` by the app itself.

**Provisioning the pool:** the User Pool and app client are defined as Terraform in `deploy/terraform/cognito`, which calls the shared `AWS-Cognito` module from the [Cognitech-terraform-iac-modules](https://github.com/KahBrightTech/Cognitech-terraform-iac-modules) repo. Run `terraform apply` there first (see that folder's README).

**Wiring the app to the pool:** the pool ID/client ID/region are injected at **container startup**, not baked into the build. `docker/50-generate-env-config.sh` runs automatically when the container starts (it's dropped into nginx's `/docker-entrypoint.d/`), reads `VITE_COGNITO_USER_POOL_ID` / `VITE_COGNITO_CLIENT_ID` / `VITE_COGNITO_REGION` from the container's env, and writes them to `/config/env-config.js`, which `index.html` loads before the app bundle. `src/auth/cognito.js` reads `window.__ENV__` first and only falls back to Vite's build-time `import.meta.env.VITE_*` when running outside a container (e.g. `npm run dev`). One consequence: the same built image can be deployed against dev/staging/prod pools just by changing env vars/secrets - no rebuild needed.

- Local dev (`npm run dev` / `npm run preview`, no Docker): copy `.env.example` to `.env` and fill in the three values from the Terraform outputs.
- Docker Compose: same three vars, but as regular environment variables Compose reads from a root `.env` file (see `docker-compose.yml`) - not build args.
- Kubernetes/Helm: set `cognito.userPoolId`, `cognito.clientId`, `cognito.region` in `deploy/helm/little-doctor-academy/values.yaml` (or `--set`), or point `cognito.existingSecret` at a Secret you manage separately (Terraform, External Secrets, etc.) with keys `VITE_COGNITO_USER_POOL_ID` / `VITE_COGNITO_CLIENT_ID` / `VITE_COGNITO_REGION`. The chart injects these into the pod via `secretKeyRef`.

There is still no backend API for this app (see the roadmap below) - once one exists, it should validate the Cognito-issued JWT on every request rather than trusting the client.
