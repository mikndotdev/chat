FROM oven/bun:1 AS base
WORKDIR /usr/src/app

ENV LOGTO_COOKIE_SECRET="placeholder"
ENV REDIS_URL="redis://placeholder@0.0.0.0:6379"

FROM base AS install

RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS builder
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN apt-get update && apt-get install -y openssl
RUN bunx prisma generate
ENV NODE_ENV=production
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /usr/src/app/public ./public
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

COPY --chown=nextjs:nodejs <<EOF /app/start.sh
#!/bin/sh
echo "Applying database migrations..."
bunx prisma migrate deploy
echo "Starting the application..."
exec bun server.js
EOF

RUN chmod +x /app/start.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/start.sh"]