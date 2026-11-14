# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/db/package.json ./packages/db/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json ./apps/api/

FROM base AS deps
RUN npm ci --workspace=apps/api --include-workspace-root

FROM deps AS build
COPY packages/types ./packages/types
COPY packages/db ./packages/db
COPY packages/i18n ./packages/i18n
COPY packages/config ./packages/config
COPY apps/api ./apps/api
RUN npm run build --workspace=packages/types
RUN npm run build --workspace=packages/db
RUN npm run build --workspace=apps/api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/packages/db/generated ./packages/db/generated
COPY --from=build /app/packages/db/prisma ./packages/db/prisma
EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
