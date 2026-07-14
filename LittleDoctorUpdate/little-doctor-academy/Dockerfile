# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# Use a clean, deterministic install from the lockfile when present (lower
# memory + faster than resolving the tree). Fall back to npm install if the
# lockfile is missing. --no-audit/--no-fund cut extra network/CPU work.
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine
# Pull the latest Alpine security patches (openssl, libxml2, libpng, etc.)
# on every build so ECR scan findings don't accumulate between base releases.
USER root
RUN apk upgrade --no-cache
USER nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:8080/healthz || exit 1
