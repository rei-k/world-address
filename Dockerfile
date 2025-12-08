# Multi-stage Dockerfile for World Address YAML SDK
# Optimized for production deployment

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY sdk/core/package*.json ./sdk/core/

# Install dependencies
RUN npm ci
RUN cd sdk/core && npm ci

# Copy source code
COPY . .

# Build SDK
RUN cd sdk/core && npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
COPY sdk/core/package*.json ./sdk/core/
RUN npm ci --omit=dev
RUN cd sdk/core && npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/sdk/core/dist ./sdk/core/dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/scripts ./scripts

# Copy necessary files
COPY README.md LICENSE ./

# Create non-root user
RUN addgroup -g 1001 -S veyapp && \
    adduser -S veyapp -u 1001
USER veyapp

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Expose port (if running as a service)
EXPOSE 3000

# Default command
CMD ["node", "--version"]
