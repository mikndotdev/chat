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
RUN bunx prisma generate
ENV NODE_ENV=production
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /usr/src/app/public ./public
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Applying database migrations..."' >> /app/start.sh && \
    echo 'bunx prisma migrate deploy' >> /app/start.sh && \
    echo 'echo "Starting the application..."' >> /app/start.sh && \
    echo 'exec bun server.js' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:nodejs /app/start.sh

RUN chmod +x /app/start.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/start.sh"]