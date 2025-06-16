# ---- Build Stage ----
FROM gplane/pnpm:node22-bullseye AS builder

# Create non-root user
RUN useradd -m frontend
USER frontend

# Set workdir
WORKDIR /home/frontend/app

# Copy dependency files first (for better caching)
COPY --chown=frontend:frontend package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy rest of the app
COPY --chown=frontend:frontend . ./

# Build app
RUN pnpm run build



# ---- Production Stage ----
FROM gplane/pnpm:node22-bullseye AS production

# Create non-root user
RUN useradd -m runner
USER runner

WORKDIR /home/runner/app

# Copy built app from builder
COPY --from=builder --chown=runner:runner /home/frontend/app /home/runner/app

EXPOSE 3000

CMD ["pnpm", "run", "start"]
