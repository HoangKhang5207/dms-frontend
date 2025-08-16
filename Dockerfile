# =============================
# DMS Frontend - React (Vite)
# Multi-stage: build with Node, serve with Nginx
# =============================

# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source
COPY . .

# Copy PDFTron webviewer assets (Linux-friendly alternative to Windows xcopy)
RUN mkdir -p public/webviewer \
    && cp -r node_modules/@pdftron/webviewer/public/* public/webviewer/

# Pass API base URL at build time (can be overridden via --build-arg)
ARG VITE_API_BASE_URL=http://localhost:8080/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build
RUN npm run build

# ---- Run stage ----
FROM nginx:1.27-alpine AS runner

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
