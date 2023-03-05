FROM docker.io/library/node:lts-alpine AS base

# Prepare work directory
WORKDIR /elk

FROM base AS builder

# Prepare pnpm https://pnpm.io/installation#using-corepack
RUN corepack enable

# Prepare deps
RUN apk update
RUN apk add git --no-cache

# Prepare build deps ( ignore postinstall scripts for now )
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm i --frozen-lockfile --ignore-scripts

# Copy all source files
COPY . ./

# Run full install with every postinstall script ( This needs project file )
RUN pnpm i --frozen-lockfile

# These variables are the ones that actually dictate things in the Docker container
# ENV NUXT_PUBLIC_SINGLE_INSTANCE=true
ENV NUXT_PUBLIC_DEFAULT_SERVER=tech.lgbt
ENV NUXT_PUBLIC_TRANSLATE_API=https://translate.universeodon.com/translate

# Build
RUN pnpm build

FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /elk/.output ./.output

EXPOSE 5314/tcp

# The default ENV
ENV PORT=5314

# Specify container only environment variables ( can be overwritten by runtime env )
ENV NUXT_STORAGE_FS_BASE='/elk/data'

CMD ["node", ".output/server/index.mjs"]
