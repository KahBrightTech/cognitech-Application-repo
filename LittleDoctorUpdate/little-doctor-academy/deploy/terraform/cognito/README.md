# Cognito for Little Doctor Academy

Provisions the Amazon Cognito User Pool that backs parent sign-up/sign-in for this app. It calls the reusable `AWS-Cognito` module from the [Cognitech-terraform-iac-modules](https://github.com/KahBrightTech/Cognitech-terraform-iac-modules) repo rather than duplicating Cognito resources here.

## What this creates

- One Cognito User Pool (`little-doctor-academy`), email as the username, self-service sign-up enabled
- One public app client (`web-app`) with no secret, using SRP auth only (the password never goes over the wire)
- Optional TOTP MFA (parents can turn it on; it isn't required)
- One AWS Secrets Manager secret (`secret_name`, default `little-doctor-academy/cognito`), written by this config's own `secrets.tf` as soon as the pool/client exist, with `VITE_COGNITO_USER_POOL_ID` / `VITE_COGNITO_CLIENT_ID` / `VITE_COGNITO_REGION` as its keys - see "Wire the app to the pool" below

No Hosted UI domain, identity pool, Lambda triggers, or user groups are created — the app signs users in directly against the pool from the browser and doesn't need any of that yet.

## Deploy

```bash
cd deploy/terraform/cognito
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars with your real account_name / tags

terraform init
terraform plan
terraform apply
```

## Wire the app to the pool

After `apply`, the same three values are available two ways:

**1. AWS Secrets Manager (automatic, recommended for CI/ops)**

`secrets.tf` writes the values into a Secrets Manager secret as part of `apply`, reading them straight off the `AWS-Cognito` module's own outputs (`user_pool_id`, `clients["web-app"].id`), so nothing needs to be copy/pasted by hand:

```bash
terraform output cognito_secret_name   # e.g. little-doctor-academy/cognito
aws secretsmanager get-secret-value --secret-id "$(terraform output -raw cognito_secret_name)" --query SecretString --output text
```

The secret's JSON body has the exact keys the app needs: `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, `VITE_COGNITO_REGION`. Override the secret's name with the `secret_name` variable if you want it to match your own naming convention.

**2. Plain `terraform output` (quick local/manual use)**

```bash
terraform output user_pool_id
terraform output web_app_client_id
terraform output aws_region
```

Either way, these map to `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, and `VITE_COGNITO_REGION`, supplied at **container startup**, not baked into the image:

- Local dev without Docker: put them in `.env` (see the app's `.env.example`).
- `docker compose up`: same three vars, read from the root `.env` file as regular container environment variables (see `docker-compose.yml`).
- Kubernetes/Helm: `--set cognito.userPoolId=... --set cognito.clientId=... --set cognito.region=...`, or point `cognito.existingSecret` at a Kubernetes Secret you populate from the Secrets Manager secret above (e.g. `kubectl create secret generic little-doctor-cognito --from-literal=VITE_COGNITO_USER_POOL_ID=... --from-literal=VITE_COGNITO_CLIENT_ID=... --from-literal=VITE_COGNITO_REGION=...`, fed by the `aws secretsmanager get-secret-value` call above, or the AWS Secrets Store CSI driver) - see the root `README.md`'s Authentication section and `deploy/helm/little-doctor-academy/values.yaml`.

The same built image works against any of these; a container entrypoint script writes the values into a small JS file the app reads on load (see `docker/50-generate-env-config.sh` in the app root).

## GitHub repository secrets

- `AWS_GITHUB_ACTIONS_ROLE_ARN`
- `EKS_CLUSTER_NAME`
- `K8S_NAMESPACE`
- `APP_HOST`
- `ACM_CERTIFICATE_ARN`
- No Cognito secret is needed here - it's supplied per-environment via the Helm `cognito.*` values / `cognito.existingSecret` at deploy time, not baked into the image build (see "Authentication" below).

## Notes

- `deletion_protection` defaults to `INACTIVE` so this is easy to tear down while you're setting things up. Flip `cognito.deletion_protection = "ACTIVE"` in `main.tf` before a real launch.
- `advanced_security_mode` is `OFF` to avoid extra per-MAU cost. Cognito's compromised-credential checks (`AUDIT` or `ENFORCED`) are worth turning on once the app has real traffic.
- The Secrets Manager secret uses the `AWS-Cognito` module's default 30-day recovery window on delete; see that module's README if you need it configurable.
- If a backend API gets added later (per the app's roadmap), it should validate the Cognito-issued JWT on every request rather than trusting the frontend.
