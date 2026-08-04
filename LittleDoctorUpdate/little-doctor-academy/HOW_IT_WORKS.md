# Little Doctor Academy: How It Works

This document explains the runtime flow for the Little Doctor Academy frontend from local app code through container startup, Helm deployment, and Kubernetes secret delivery.

## High-level flow

The app is a static React frontend built with Vite and served by nginx.

At runtime, the browser does not talk to Kubernetes or AWS Secrets Manager directly. Instead, the container prepares a small config file before nginx starts, and the browser reads that file when the page loads.

The end-to-end flow is:

1. Source code is built into static assets.
2. The Docker image is pushed to ECR without environment-specific Cognito values baked in.
3. Helm deploys the image to Kubernetes.
4. Kubernetes mounts Cognito values into the container at `/etc/secrets`.
5. A startup script reads those files and writes `/usr/share/nginx/html/config/env-config.js`.
6. `index.html` loads that config file before the app bundle.
7. The React app reads the config from `window.__ENV__` and initializes Cognito.

## App code

The frontend entry path is:

- `index.html`
- `src/main.jsx`
- `src/App.jsx`
- `src/auth/cognito.js`

`index.html` loads `/config/env-config.js` before the app bundle so runtime config is available immediately.

`src/auth/cognito.js` reads three values:

- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`
- `COGNITO_REGION`

It first checks `window.__ENV__`. If that object is empty, it falls back to local `import.meta.env.COGNITO_*` values for non-container workflows such as `npm run dev`.

## Container startup

The Docker image is defined in `Dockerfile`.

The build stage runs `npm run build` and produces static files in `dist`.

The runtime stage uses `nginxinc/nginx-unprivileged:stable-alpine`. Two startup mechanisms matter here:

1. nginx renders `nginx.conf.template` into `/etc/nginx/conf.d/default.conf`.
2. nginx runs `docker/50-generate-env-config.sh` before starting the server.

The startup script does the Cognito wiring. It reads values from `/etc/secrets` when available and falls back to container environment variables when they are not. It then generates this file:

- `/usr/share/nginx/html/config/env-config.js`

That generated file looks like:

```js
window.__ENV__ = {
  COGNITO_USER_POOL_ID: "...",
  COGNITO_CLIENT_ID: "...",
  COGNITO_REGION: "us-east-1"
};
```

The same script also exports `COGNITO_REGION` so nginx can build the Content Security Policy with the correct Cognito regional endpoint.

## Local development

For local development without Kubernetes:

1. Copy `.env.example` to `.env`.
2. Fill in `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, and `COGNITO_REGION`.
3. Run `npm install` and `npm run dev`.

In this mode, the app falls back to `import.meta.env.COGNITO_*` through Vite.

## Docker Compose

`docker-compose.yml` passes `COGNITO_*` values into the container as environment variables.

When the container starts:

1. `docker/50-generate-env-config.sh` reads those variables.
2. It writes `/config/env-config.js`.
3. nginx serves the app.
4. The browser loads the config and Cognito works.

No image rebuild is needed when only the Cognito values change.

## Helm deployment

The Helm chart lives in `helm`.

The most important chart files for runtime behavior are:

- `helm/values.yaml`
- `helm/templates/frontend-deployment.yaml`
- `helm/templates/secret.yaml`
- `helm/templates/secretproviderclass.yaml`
- `helm/templates/_helpers.tpl`

### What values Helm controls

`helm/values.yaml` controls:

- image registry and repository
- frontend image tag
- namespace and labels
- ingress hostname and ALB settings
- autoscaling and resource settings
- Cognito secret delivery mode

### The deployment template

`helm/templates/frontend-deployment.yaml` deploys the frontend container and mounts `/etc/secrets`.

There are two modes:

1. `cognito.secretManager.enabled=true`
2. `cognito.secretManager.enabled=false`

In both cases, the container reads from the same path: `/etc/secrets`.

That consistency is intentional. It means the app startup path does not change across environments.

## Secret delivery modes

### Mode 1: AWS Secrets Manager through CSI

When `cognito.secretManager.enabled=true`:

1. Helm creates a `SecretProviderClass` from `helm/templates/secretproviderclass.yaml`.
2. The pod mounts a CSI volume at `/etc/secrets`.
3. The AWS Secrets Store CSI driver reads the named AWS secret.
4. The files appear inside the container under `/etc/secrets`.
5. `docker/50-generate-env-config.sh` reads them and generates browser config.

This mode requires:

- the Secrets Store CSI driver installed in the cluster
- the AWS provider for the CSI driver
- a service account with IAM access to read the AWS secret, usually via IRSA

### Mode 2: Kubernetes Secret volume

When `cognito.secretManager.enabled=false`:

1. Helm either creates a Kubernetes Secret from `helm/templates/secret.yaml`, or
2. you point `cognito.existingSecret` at a Secret you manage yourself
3. the deployment mounts that Secret at `/etc/secrets`
4. the startup script reads the files and generates browser config

This mode does not require the CSI driver.

## Which keys must exist

The runtime ultimately expects these logical values:

- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`
- `COGNITO_REGION`

For the AWS Secrets Manager path, the chart currently supports `COGNITO_PRIMARY_CLIENT_ID` in the upstream AWS secret and maps it into the runtime as the client ID.

For the Kubernetes Secret volume path, each secret entry becomes a file in `/etc/secrets`, so file names must match the expected keys.

## GitHub Actions deployment

The generic deployment workflow is:

- `.github/workflows/deploy-primary-application-with-helm.yml`

This workflow:

1. checks out the repo
2. validates the chart path and optional values file
3. authenticates to AWS
4. updates kubeconfig for the target EKS cluster
5. verifies the requested image tag exists in ECR
6. runs `helm upgrade --install`

The workflow can take an optional `values_file` input. Helm then merges values in this order:

1. chart defaults from `helm/values.yaml`
2. the user-provided `values_file`
3. `--set-string` values passed by the workflow

That means workflow inputs override the same keys in the values file for fields such as namespace, registry, repository, and image tags.

## Build-time vs deploy-time vs runtime

### Build-time

At build-time:

- React assets are compiled
- the Docker image is created
- no Cognito environment-specific values need to exist yet

This is why the image can be stored in ECR before the Cognito resources are provisioned.

### Deploy-time

At deploy-time:

- Helm chooses which image tag to run
- Helm configures the namespace, ingress, resources, and secret mode
- Kubernetes is told how to mount Cognito configuration into the pod

### Runtime

At runtime:

- the pod starts
- `/etc/secrets` is mounted
- the startup script generates `/config/env-config.js`
- the browser loads the app and reads runtime Cognito config

If the image exists in ECR but the secret does not exist by pod startup time, the deployment may fail or the app may start without usable Cognito settings, depending on the chosen secret mode.

## Troubleshooting checklist

If Cognito login is not working, check these in order:

1. Is `/config/env-config.js` being served with populated values?
2. Does the pod have files under `/etc/secrets`?
3. If using CSI, does the pod service account have IRSA access to the AWS secret?
4. Does the AWS secret contain the expected keys?
5. If using a Kubernetes Secret, does it use the expected key names?
6. Is the deployed namespace the same one the Secret or SecretProviderClass was created in?
7. Did the GitHub Actions workflow override any values you expected to come from a values file?

## Summary

This app is designed so the image stays reusable across environments.

The secret does not get baked into the image. Instead, Kubernetes mounts the config into the running container, the startup script translates that config into a browser-readable file, and the frontend reads it at page load.