# ── Stage 1: Build ─────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Brings in src/, index.html and the vite/tailwind configs (see .dockerignore)
COPY . .
RUN npm run build

# ── Stage 2: Serve with nginx ──────────────────────────────────────────────
FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
