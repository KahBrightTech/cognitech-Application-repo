# Deploy to ECR — CI/CD Workflows

CI/CD pipelines that build, test, scan, and push application Docker images to Amazon ECR. Deployment to EKS is handled separately.

## How it works

Each application has its own self-contained workflow file (e.g. `deploy-littledoctor.yml`). The workflow:

1. **Triggers automatically** on a push to `main` that touches any file inside the app's folder, or **manually** from the Actions tab (Run workflow) with optional inputs.
2. **Discovers components** — every directory inside the app folder containing a `Dockerfile` is a buildable component (e.g. `backend`, `frontend`). Multi-tier apps get one parallel build job per component.
3. **Detects changes** (push only) — the pushed commits are diffed, and a component is built only if a *code* file inside its own directory changed. Docs, markdown, and image edits are ignored, so a docs-only push starts a short no-op run and builds nothing. Manual runs always build all components.
4. **Detects the language** of each component from marker files and runs the matching toolchain:

   | Marker file | Language | Steps |
   |---|---|---|
   | `package.json` | Node.js 18 | `npm ci` → `npm run lint` → `npm test` → `npm run test:integration` (all `--if-present`) |
   | `requirements.txt` / `pyproject.toml` / `setup.py` | Python 3.11 | pip install → ruff (non-blocking) → pytest |
   | `go.mod` | Go | `go vet` → `go test` |
   | `pom.xml` | Java 17 (Maven) | `mvn verify` |
   | `build.gradle(.kts)` | Java 17 (Gradle) | `./gradlew build` |
   | `*.csproj` | .NET 8 | restore → build → test |
   | none of the above | unknown | lint/test skipped; image still built |

5. **Scans** the source with Trivy (dependency CVEs from lockfiles), builds the image, scans the image with Trivy. Results upload to the repo's Security tab. Scans are non-blocking unless `fail_on_scan` is set on a manual run.
6. **Versions and pushes** to ECR. The version auto-increments per component by reading existing ECR tags (`v1.0.0` if none exist), or uses the explicit `version` input. Two tags are pushed: `<app>-<component>-vX.Y.Z` and `<app>-<component>-latest`.

## Image naming

```
<ECR registry>/int-production-use1-ecs:<APP_NAME>-<component>-v<X.Y.Z>
```

Example: `littledoctor-little-doctor-academy-v1.0.3`. Keep `APP_NAME` stable — changing it restarts versioning at `v1.0.0` under the new prefix.

## Adding a new app

Copy `deploy-littledoctor.yml` to `deploy-<newapp>.yml` and change **4 lines** (marked with 👈 in the file):

| Line | Setting | Example |
|---|---|---|
| `name:` | Workflow name | `Deploy-MovieNight` |
| `paths:` entry | App folder trigger | `- 'MovieNight/**'` |
| `env.APP_NAME` | Image tag prefix | `movienight` |
| `env.APP_DIR` | App folder | `MovieNight` |

`paths:` cannot use variables — GitHub evaluates trigger filters before any workflow context exists, so the folder name must be hardcoded there.

Requirements for the app folder itself:

- Each buildable component needs a `Dockerfile` in its directory.
- If a component declares a `lint` script, its lint config must exist (ESLint 9 requires a flat `eslint.config.js`).
- If a component declares a `test` script, test files must exist — or use `vitest run --passWithNoTests` / `jest --passWithNoTests`.
- Components with no lint/test scripts are fine; those steps are skipped.

## Manual run inputs

| Input | Default | Purpose |
|---|---|---|
| `run_integration_tests` | `true` | Run `test:integration` / `tests/integration` if present |
| `run_image_scan` | `true` | Trivy scans of source and image |
| `fail_on_scan` | `false` | Fail the build on CRITICAL/HIGH vulnerabilities |
| `version` | auto | Explicit tag, e.g. `v2.0.0`; empty auto-increments from ECR |

## Files

| File | Role |
|---|---|
| `deploy-littledoctor.yml` | LittleDoctor app pipeline (template for new apps) |
| `deploy-application-to-ecr.yml` | Generic/reusable engine — manual builds of any folder via `app_dir` + `app_name` inputs; also callable from other workflows (`workflow_call`). Not push-triggered. |
| `deploy-application-with-helm.yml` / `deploy-appliocation-with-kubectl.yml` | EKS deployment (separate from image CI) |

## AWS access

Auth uses GitHub OIDC (no stored AWS keys): role `int-prod-OIDCGitHubRole-role`, region `us-east-1`, ECR repository `int-production-use1-ecs`. Override per manual run via workflow inputs where exposed.

## Troubleshooting

- **"ESLint couldn't find an eslint.config.js file"** — the component uses ESLint 9 but has no flat config. Add `eslint.config.js` next to its `package.json`.
- **"No test files found, exiting with code 1"** — the component declares a `test` script but has no tests. Add tests or `--passWithNoTests`.
- **Nothing built after a push** — the changed files were docs/images, or outside any component directory. Check the "Detect changed components" job log; it lists every component and whether it was built or skipped.
- **Version didn't increment** — versions are read from existing ECR tags matching `<APP_NAME>-<component>-vX.Y.Z`; a changed `APP_NAME` or component folder name starts a new sequence.
