echo "Running db migrations..."
source ./.venv/bin/activate
uv run alembic upgrade head
uv run main.py
