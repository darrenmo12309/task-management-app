# Stage 1: build the React app into static files
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve the static files with nginx — no Node.js in the final image
FROM nginx:alpine AS runner

# Create a non-root user and grant it write access to the directories nginx needs at runtime.
# nginx requires these paths to be writable; by default they are owned by root.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /var/cache/nginx \
    && chown -R appuser:appgroup /var/log/nginx \
    && chown -R appuser:appgroup /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown appuser:appgroup /var/run/nginx.pid

COPY --from=builder /app/dist /usr/share/nginx/html

USER appuser

# nginx.conf is injected via Helm ConfigMap at runtime — not baked into the image
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
