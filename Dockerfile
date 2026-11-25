FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000 DATA_DIR=/app/data
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/scripts/setup-container.mjs ./setup-container.mjs
COPY --from=build --chown=node:node /app/lib/portfolio/initial-content.json ./initial-content.json
COPY --from=build --chown=node:node /app/lib/server/schema-statements.json ./schema-statements.json
RUN mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 3000
CMD ["sh", "-c", "node setup-container.mjs && exec node server.js"]
