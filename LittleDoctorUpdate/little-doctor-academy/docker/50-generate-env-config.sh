#!/bin/sh
# Runs automatically at container startup (nginx's base image executes
# every script in /docker-entrypoint.d/ before starting nginx). Writes the
# Cognito pool/client config, sourced from plain env vars, into a JS file
# the app loads before its own bundle. This is what lets the same image
# be deployed against different pools (dev/staging/prod) purely by
# changing env vars / Helm secret values - no rebuild required.
set -eu

CONFIG_DIR="/usr/share/nginx/html/config"
mkdir -p "$CONFIG_DIR"

cat > "$CONFIG_DIR/env-config.js" <<EOF
window.__ENV__ = {
  VITE_COGNITO_USER_POOL_ID: "${VITE_COGNITO_USER_POOL_ID:-}",
  VITE_COGNITO_CLIENT_ID: "${VITE_COGNITO_CLIENT_ID:-}",
  VITE_COGNITO_REGION: "${VITE_COGNITO_REGION:-us-east-1}"
};
EOF
