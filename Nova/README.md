# NOVA — Your Personal AI Universe

A cinematic, glassmorphic AI assistant dashboard. An animated neural core reacts to your
voice, a conversational assistant answers you out loud, and a live insight rail tracks
conditions, core vitals, and recommendations.

**Everything runs locally.** No API keys, no third-party AI calls, no outbound network
traffic from the containers.

| | |
|---|---|
| **Frontend** | React 18 · Vite 6 · Tailwind CSS 3 · Framer Motion · lucide-react, served by nginx |
| **Backend** | FastAPI (Python 3.12) on uvicorn |
| **Voice** | Browser Web Speech API (speech-to-text + text-to-speech) |
| **Runtime** | Two Docker containers on a private bridge network |

---

## 1. Project layout

```text
Nova/
├── docker-compose.yml
├── README.md
├── backend/                 # FastAPI "NOVA core"
│   ├── Dockerfile
│   ├── main.py              # API routes
│   ├── nova_brain.py        # offline conversational engine
│   ├── telemetry.py         # simulated live metrics
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── tests/test_api.py
└── frontend/                # React SPA
    ├── Dockerfile
    ├── nginx.conf           # static serving + /api proxy + security headers
    ├── index.html
    └── src/
        ├── App.jsx
        ├── components/      # NovaOrb, ChatPanel, WeatherCard, VitalsCard, …
        ├── hooks/useVoice.js
        └── lib/api.js
```

### API surface

| Method | Route | Purpose |
|--------|-------|---------|
| `GET`  | `/api/health` | Container healthcheck |
| `POST` | `/api/chat` | `{ "message": "..." }` → NOVA's reply |
| `GET`  | `/api/weather` | Current conditions |
| `GET`  | `/api/insights` | Core vitals + 24-point activity series |
| `GET`  | `/api/recommendations` | Three rotating suggestions |
| `GET`  | `/api/briefing` | All of the above in one round trip |

---

## 2. Run locally on Docker Desktop

### Prerequisites

- **Docker Desktop** running (Windows: WSL 2 backend recommended)
- Ports **8080** and **8000** free

Verify Docker is up:

```powershell
docker version
docker compose version
```

### Start the app

From the `Nova` folder:

```powershell
cd C:\Users\Owner\Downloads\GitRepos\cognitech-repos\cognitech-Application-repo\Nova
docker compose up --build
```

First build takes a couple of minutes (npm install + pip install). When you see
`nova-frontend` start, open:

### 👉 <http://localhost:8080>

The backend API is also exposed directly at <http://localhost:8000/api/health> and
interactive docs at <http://localhost:8000/docs>.

### Run detached / stop / reset

```powershell
docker compose up --build -d      # start in the background
docker compose logs -f            # tail logs from both services
docker compose logs -f backend    # tail just the API
docker compose ps                 # container status + health
docker compose down               # stop and remove containers
docker compose down --rmi local -v   # also delete the built images
```

### Rebuild after a code change

```powershell
docker compose up --build -d frontend   # rebuild just the UI
docker compose up --build -d backend    # rebuild just the API
```

### Configuration

Set these in your shell or a `.env` file next to `docker-compose.yml`:

| Variable | Default | Purpose |
|----------|---------|---------|
| `NOVA_CITY` | `San Francisco` | City label shown on the conditions card |
| `NOVA_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | CORS allow-list (only needed for the Vite dev server) |

In Docker the browser talks to nginx on port 8080 and nginx proxies `/api/` to the
backend over the private network, so the API is same-origin and CORS is not involved.

---

## 3. Using NOVA

- **Click the glowing core** (or the mic button) and speak. The orb switches to
  *Listening*, then *Thinking*, then *Responding* — and NOVA answers out loud.
- **Or just type.** Voice-in/voice-out needs a Chromium-based browser
  (Chrome, Edge, Brave); typing works everywhere.
- Try: *"what's the weather"*, *"system status"*, *"what should I focus on"*,
  *"tell me something about space"*, *"who are you"*.
- The browser will ask for microphone permission the first time — that audio is
  processed by the browser's speech engine and never reaches the container.

---

## 4. Develop without Docker (hot reload)

Two terminals:

```powershell
# Terminal 1 — API on :8000
cd Nova\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt -r requirements-dev.txt
uvicorn main:app --reload --port 8000
```

```powershell
# Terminal 2 — UI on :5173 (proxies /api to :8000)
cd Nova\frontend
npm install
npm run dev
```

Run the backend tests:

```powershell
cd Nova\backend
pytest -q
```

---

## 5. Deploy to AWS ECR

CI/CD lives in [.github/workflows/deploy-nova-to-ecr.yml](../.github/workflows/deploy-nova-to-ecr.yml)
and follows the same engine as the other apps in this repo.

### What the workflow does

1. **Discovers components** — every directory under `Nova/` containing a `Dockerfile`
   (so `backend` and `frontend`).
2. **Builds only what changed** on a push; manual runs build everything.
   Markdown/image-only changes build nothing.
3. **Detects the language**, then installs, lints, and tests each component
   (`ruff` + `pytest` for Python, `npm` scripts + production build for Node).
4. **Scans the source** with Trivy (filesystem) and uploads SARIF to the Security tab.
5. **Builds the image**, then **scans the image** with Trivy.
6. **Pushes the versioned tag** to ECR, then moves `latest` **only if the
   repository allows mutable tags** (see below).

It does **not** deploy to EKS — that is handled separately by the release process.

### Triggers

| Trigger | Behaviour |
|---------|-----------|
| Push to `main` touching `Nova/**` | Builds only the changed components |
| **Actions → deploy-nova-to-ecr → Run workflow** | Builds all components, with options for integration tests, image scanning, fail-on-scan, and an explicit version |

### Image tags

Images go to the CDK container-assets repository
`cdk-hnb659fds-container-assets-533267408704-us-east-1` in `us-east-1`:

```text
533267408704.dkr.ecr.us-east-1.amazonaws.com/cdk-hnb659fds-container-assets-533267408704-us-east-1:nova-backend-v1.0.1
533267408704.dkr.ecr.us-east-1.amazonaws.com/cdk-hnb659fds-container-assets-533267408704-us-east-1:nova-frontend-v1.0.1
```

The patch number auto-increments from the highest existing `nova-<component>-vX.Y.Z` tag
in ECR. For a minor or major bump, run the workflow manually and set **version** to e.g.
`v1.1.0`.

> **No `latest` tag on this registry.** CDK bootstrap asset repositories are created
> with `imageTagMutability: IMMUTABLE`, so a moving `latest` pointer cannot be
> repointed at a new digest — the push is rejected with
> `tag invalid: ... cannot be overwritten because the tag is immutable`.
> The workflow detects this and skips `latest`, so **always deploy by explicit
> version tag**. If you want `latest` back, push to a repository created with
> `--image-tag-mutability MUTABLE`.

### Authentication

The workflow authenticates with **GitHub OIDC** — no long-lived AWS keys are stored.
It assumes `arn:aws:iam::533267408704:role/md-preprod-OIDCGitHubRole-role`. To change
account, region, or repository, edit the `env:` block at the top of the workflow.

The role's trust policy must allow this repository, and its permissions policy needs
`ecr:GetAuthorizationToken` plus `ecr:BatchCheckLayerAvailability`,
`ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`,
`ecr:PutImage`, `ecr:DescribeImages`, and `ecr:DescribeRepositories` on the target
repository. `DescribeImages` drives the version auto-increment and
`DescribeRepositories` is how the workflow detects immutable tags.

### Deploy checklist

1. Confirm it runs clean locally: `docker compose up --build`.
2. Commit the `Nova/` folder and push to `main`.
3. Watch **Actions → deploy-nova-to-ecr**.
4. Confirm the new tags in ECR:

   ```powershell
   aws ecr describe-images `
     --repository-name cdk-hnb659fds-container-assets-533267408704-us-east-1 `
     --region us-east-1 `
     --query "reverse(sort_by(imageDetails,&imagePushedAt))[:5].imageTags"
   ```

### Pull and run an ECR image locally

```powershell
$registry = "533267408704.dkr.ecr.us-east-1.amazonaws.com"
$repo = "cdk-hnb659fds-container-assets-533267408704-us-east-1"

aws ecr get-login-password --region us-east-1 | `
  docker login --username AWS --password-stdin $registry

docker pull "$registry/${repo}:nova-frontend-latest"
docker pull "$registry/${repo}:nova-backend-latest"
```

---

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `port is already allocated` | Change the host port in `docker-compose.yml` (e.g. `"8081:80"`) or stop the conflicting container. |
| UI loads but cards stay as grey skeletons | The API isn't healthy. Run `docker compose logs backend` and check `http://localhost:8000/api/health`. |
| `Core offline` badge in the top bar | Same as above — the frontend can't reach `/api`. |
| Mic button is disabled | Browser has no Web Speech API. Use Chrome or Edge; typing still works. |
| Nothing is spoken back | NOVA only speaks replies to **voice** input. Typed messages reply in text only. |
| Frontend build fails on `npm install` | Delete `frontend/node_modules` and rebuild with `docker compose build --no-cache frontend`. |
| Trivy fails the CI build | Only when **fail_on_scan** is enabled on a manual run. Otherwise findings are reported to the Security tab without blocking. |
| CI fails at `Configure AWS credentials` | The OIDC role's trust policy doesn't allow this repo, or the ARN in the workflow `env:` block is wrong. |
| CI fails at `Push to ECR` with `AccessDenied` | The role is missing ECR push permissions on `cdk-hnb659fds-container-assets-533267408704-us-east-1`. |
| `tag invalid: ... the tag is immutable` | The registry has immutable tags and something tried to move `latest`. The workflow now skips `latest` automatically — deploy by version tag instead. |
