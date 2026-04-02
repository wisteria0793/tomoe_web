# --- Stage 1: Build ---
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM nginx:stable-alpine AS production

# Copy build artifacts from stage 1
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
