# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/db/package.json ./packages/db/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/config/package.json ./packages/config/
COPY apps/worker/package.json ./apps/worker/

FROM base AS deps
RUN npm ci --workspace=apps/worker --include-workspace-root

FROM deps AS build
COPY packages/types ./packages/types
COPY packages/db ./packages/db
COPY apps/worker ./apps/worker
RUN npm run build --workspace=packages/types
RUN npm run build --workspace=packages/db
RUN npm run build --workspace=apps/worker

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# sharp requires native binaries; install fresh in final stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/worker/dist ./apps/worker/dist
COPY --from=build /app/apps/worker/package.json ./apps/worker/package.json
RUN npm install --workspace=apps/worker sharp --prefer-offline 2>/dev/null || true
EXPOSE 0
CMD ["node", "apps/worker/dist/index.js"]
