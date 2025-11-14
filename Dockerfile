FROM node:20-slim AS deps
WORKDIR /app
ENV CI=true
COPY package*.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY . .
# Build client (Vite) + bundle server via build script
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080
# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
# Copy build output (dist contains both server bundle and public assets per build script)
COPY --from=builder /app/dist /app/dist
# Ensure writable uploads dir
RUN mkdir -p /app/server/uploads && chown -R node:node /app
USER node
EXPOSE 8080
CMD ["node", "dist/index.js"]