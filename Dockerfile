# ==============================================================================
# CycloNerveAI - Production Dockerfile for Google Cloud Run
# Multi-stage, non-root user, minimal attack surface, Node.js 22 LTS
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Builder
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json ./
RUN npm install --ignore-scripts

# Copy application source
COPY . .

# Run production client build (Vite SPA -> dist/)
ENV NODE_ENV=production
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Runner
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Statutory Security: Run as non-root user
USER node

# Copy package manifests and production dependencies
COPY --chown=node:node package.json ./
RUN npm install --omit=dev --ignore-scripts && npm install tsx --no-save

# Copy built frontend client assets from builder
COPY --chown=node:node --from=builder /app/dist ./dist

# Copy server, shared, and domain runtime source
COPY --chown=node:node server.ts ./
COPY --chown=node:node src ./src
COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node metadata.json ./

# Environment defaults (Cloud Run injects PORT and credentials via Secret Manager)
ENV NODE_ENV=production \
    PORT=3000 \
    NODE_OPTIONS="--import tsx" \
    ADAPTER_MODE="mock" \
    USE_MOCK_ADAPTERS="true"

# Expose standard container port
EXPOSE 3000

# Container health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/api/health || exit 1

# Launch hardened server
CMD ["node", "server.ts"]
