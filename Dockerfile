# Image de base optimisée pour l'environnement de production
FROM node:20-alpine AS base

# 1. Étape d'installation des dépendances 
# ---------------------------------------------------------------------------
FROM base AS deps
# Indispensable pour certaines librairies C dans Alpine (Next.js SWC)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# On installe les dépendances en utilisant un package-lock.json pour la reproductibilité
COPY package.json package-lock.json ./
RUN npm ci

# 2. Étape de compilation (Build)
# ---------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Désactive la télémétrie Next.js car l'app tournera sur le réseau interne CORICA
ENV NEXT_TELEMETRY_DISABLED 1

# Compile le code en mode "Standalone" très performant et sécurisé
RUN npm run build

# 3. Étape de Production (Runner)
# ---------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Création d'un utilisateur non-root pour des raisons de sécurité informatiques strictes
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# On copie uniquement les ressources publiques (images, etc)
COPY --from=builder /app/public ./public

# On copie le serveur "standalone" précompilé (beaucoup moins lourd)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# On assigne les droits à l'utilisateur `nextjs` sécurisé
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Démarrage direct du mini-serveur node précompilé par la fonctionnalité 'standalone'
CMD ["node", "server.js"]
