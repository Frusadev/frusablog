echo "Running db migrations..."
source ./.venv/bin/activate
alembic upgrade head
uv run main.py
