# Stage 1: install only production dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: lean runtime image with no build tools or dev dependencies
FROM node:20-alpine AS runner
WORKDIR /app

# Run as a non-root user — required by the Helm deployment's runAsNonRoot security context
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/

USER appuser

EXPOSE 3000
CMD ["node", "src/server.js"]
