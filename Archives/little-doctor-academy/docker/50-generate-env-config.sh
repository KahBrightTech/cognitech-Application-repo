#!/bin/sh
# Runs automatically at container startup (nginx's base image executes
# every script in /docker-entrypoint.d/ before starting nginx). Writes the
# Cognito pool/client config, sourced from mounted secret files when present
# and otherwise from plain env vars, into a JS file the app loads before its
# own bundle. This is what lets the same image be deployed against different
# pools (dev/staging/prod) without rebuilding it.
set -eu

CONFIG_DIR="/usr/share/nginx/html/config"
SECRETS_DIR="/etc/secrets"
mkdir -p "$CONFIG_DIR"

read_config_value() {
  for key in "$@"; do
    if [ -f "$SECRETS_DIR/$key" ]; then
      tr -d '\r\n' < "$SECRETS_DIR/$key"
      return 0
    fi

    eval "value=\${$key:-}"
    if [ -n "$value" ]; then
      printf '%s' "$value"
      return 0
    fi
  done

  return 1
}

COGNITO_USER_POOL_ID="$(read_config_value COGNITO_USER_POOL_ID || true)"
COGNITO_CLIENT_ID="$(read_config_value COGNITO_PRIMARY_CLIENT_ID COGNITO_CLIENT_ID || true)"
COGNITO_REGION="$(read_config_value COGNITO_REGION || true)"

export COGNITO_USER_POOL_ID
export COGNITO_CLIENT_ID
export COGNITO_REGION="${COGNITO_REGION:-us-east-1}"

cat > "$CONFIG_DIR/env-config.js" <<EOF
window.__ENV__ = {
  COGNITO_USER_POOL_ID: "${COGNITO_USER_POOL_ID}",
  COGNITO_CLIENT_ID: "${COGNITO_CLIENT_ID}",
  COGNITO_REGION: "${COGNITO_REGION}"
};
EOF
