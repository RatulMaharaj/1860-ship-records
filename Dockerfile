# syntax=docker/dockerfile:1.7

###########
# 1. data
#    Use Python to download the 9 source .xls files, parse them into SQLite,
#    and pre-compute facets.json. Doing this at image-build time keeps the
#    runtime image free of Python and ensures the deployed bundle is fully
#    self-contained — the historical data never changes, so this is fine.
###########
FROM python:3.12-slim AS data

WORKDIR /work

RUN pip install --no-cache-dir pandas xlrd

COPY scripts ./scripts
RUN mkdir -p data/raw public \
    && python scripts/download.py \
    && python scripts/build_db.py \
    && python scripts/build_facets.py


###########
# 2. deps
#    Install Node dependencies with pnpm.
#    better-sqlite3 builds a native addon during install — needs build tools.
###########
FROM node:22-bookworm-slim AS deps

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
RUN corepack enable

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
# pnpm v10 requires explicit opt-in to run native build scripts in non-interactive contexts.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true


###########
# 3. build
#    Next.js production build (uses output: "standalone").
#    The data layer (DB + facets) is brought in from stage 1 so that
#    pre-render at build time can read the DB if needed.
###########
FROM node:22-bookworm-slim AS build

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=data /work/data ./data
COPY --from=data /work/public/facets.json ./public/facets.json

RUN pnpm build


###########
# 4. runtime
#    Minimal Node image. Only ships the standalone build + the static
#    assets + the SQLite DB + facets.json. No Python, no pnpm, no source.
###########
FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs nextjs

# Standalone server + static assets.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public          ./public

# Immutable historical data — ships with the image.
COPY --from=data  --chown=nextjs:nodejs /work/data/passengers.db ./data/passengers.db

USER nextjs
EXPOSE 3000

# Lightweight health probe for Coolify's healthcheck.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/search?limit=1').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
