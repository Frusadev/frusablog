FROM fedora:42 AS builder


RUN dnf install -y python3 python3-pip git && \
    pip3 install uv && \
    dnf install -y gcc g++


RUN useradd -m runner
USER runner
WORKDIR /home/runner/app

COPY --chown=runner:runner ./pyproject.toml ./uv.lock ./

# Install dependencies
RUN python3 -m venv .venv && \
    .venv/bin/python -m pip install --upgrade pip && \
    uv sync

COPY --chown=runner:runner . .

# Final production stage
FROM fedora:42 AS production

# Install system dependencies
RUN dnf install -y python3

# Create user and working dir
RUN useradd -m runner
USER runner
WORKDIR /home/runner/app

# Copy app from builder
COPY --from=builder /home/runner/app /home/runner/app

# Expose port
EXPOSE 8000

# Run app
CMD [".venv/bin/python", "main.py"]
