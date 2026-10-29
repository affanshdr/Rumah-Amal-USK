# ==============================================================================
# Stage 1: Dependencies
# ==============================================================================
FROM node:26-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Copy Prisma schema for generate step
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# ==============================================================================
# Stage 2: Build
# ==============================================================================
FROM node:26-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Environment variables needed at build time
# NEXT_PUBLIC_* vars are inlined into the JS bundle during build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG DATABASE_URL
ARG DIRECT_URL
ARG AUTH_SECRET
ARG NEXTAUTH_SECRET

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV DATABASE_URL=${DATABASE_URL}
ENV DIRECT_URL=${DIRECT_URL}
ENV AUTH_SECRET=${AUTH_SECRET}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client & build Next.js
RUN npm run build

# ==============================================================================
# Stage 3: Production Runner
# ==============================================================================
FROM node:26-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Set permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
