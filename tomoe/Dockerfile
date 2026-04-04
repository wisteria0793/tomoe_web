# --- Stage 1: Build ---
FROM node:20-slim AS build

# Build-time environment variables
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_STRIPE_PUBLIC_KEY
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV REACT_APP_STRIPE_PUBLIC_KEY=${REACT_APP_STRIPE_PUBLIC_KEY}

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
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
