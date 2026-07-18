# Cognito for Little Doctor Academy

Provisions the Amazon Cognito User Pool that backs parent sign-up/sign-in for this app. It calls the reusable `AWS-Cognito` module from the [Cognitech-terraform-iac-modules](https://github.com/KahBrightTech/Cognitech-terraform-iac-modules) repo rather than duplicating Cognito resources here.

## What this creates

- One Cognito User Pool (`little-doctor-academy`), email as the username, self-service sign-up enabled
- One public app client (`web-app`) with no secret, using SRP auth only (the password never goes over the wire)
- Optional TOTP MFA (parents can turn it on; it isn't required)

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

After `apply`, grab the outputs:

```bash
terraform output user_pool_id
terraform output web_app_client_id
terraform output aws_region
```

These map to `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, and `VITE_COGNITO_REGION`, supplied at **container startup**, not baked into the image:

- Local dev without Docker: put them in `.env` (see the app's `.env.example`).
- `docker compose up`: same three vars, read from the root `.env` file as regular container environment variables (see `docker-compose.yml`).
- Kubernetes/Helm: `--set cognito.userPoolId=... --set cognito.clientId=... --set cognito.region=...` (or `cognito.existingSecret` if you manage the Secret yourself) - see the root `README.md`'s Authentication section and `deploy/helm/little-doctor-academy/values.yaml`.

The same built image works against any of these; a container entrypoint script writes the values into a small JS file the app reads on load (see `docker/50-generate-env-config.sh` in the app root).

## Notes

- `deletion_protection` defaults to `INACTIVE` so this is easy to tear down while you're setting things up. Flip `cognito.deletion_protection = "ACTIVE"` in `main.tf` before a real launch.
- `advanced_security_mode` is `OFF` to avoid extra per-MAU cost. Cognito's compromised-credential checks (`AUDIT` or `ENFORCED`) are worth turning on once the app has real traffic.
- If a backend API gets added later (per the app's roadmap), it should validate the Cognito-issued JWT on every request rather than trusting the frontend.
