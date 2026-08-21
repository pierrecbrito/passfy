# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/api/prisma ./packages/api/prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
WORKDIR /app/packages/api
RUN npx prisma generate

# Copy source code and build
COPY tsconfig*.json /app/
COPY packages/api /app/packages/api
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3333

COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/api/prisma ./packages/api/prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Generate Prisma Client in production image
WORKDIR /app/packages/api
RUN npx prisma generate

# Copy compiled files from builder
COPY --from=builder /app/packages/api/dist ./dist

EXPOSE 3333

CMD ["node", "dist/server.js"]
