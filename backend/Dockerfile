# syntax=docker/dockerfile:1.6   # enables BuildKit cache mounts

########################
# ---- Build stage ----
########################
FROM python:3.13-slim-bookworm AS builder

# 1. System deps (build‑only)
RUN pip3 install --no-cache-dir uv

# 2. Non‑root user
RUN useradd -m runner
USER runner
WORKDIR /home/runner/app

# 3. Virtual‑env lives in /opt/venv so it’s easy to copy
RUN python3 -m venv .venv

# 4. Copy *only* lock / metadata first → better cache
COPY --chown=runner:runner pyproject.toml uv.lock ./

# 5. Install deps (optionally cache the wheelhouse)
#    Uncomment the --mount line if you build with BuildKit
RUN uv sync

# 6. Copy the rest of the source
COPY --chown=runner:runner . .

############################
# ---- Runtime stage ----
############################
FROM python:3.13-slim-bookworm AS production
RUN pip install uv

# 2. Non‑root runtime user
RUN useradd -m runner
RUN mkdir -p /home/runner/app/fs
RUN chown -R runner:runner /home/runner/app/fs
RUN chown -R runner:runner /home/runner/
USER runner
WORKDIR /home/runner/app

# 3. Copy application code *and* ready‑made venv
COPY --from=builder --chown=runner:runner /home/runner/app /home/runner/app
RUN pip install --upgrade pip

EXPOSE 8000
CMD ["bash", "./entry.bash"]
