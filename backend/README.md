# FastAPI Template

A production-ready FastAPI template with modern Python tooling, database integration, email services, and Docker support.

## 🚀 Features

- **FastAPI Framework**: High-performance async web framework
- **SQLModel Integration**: Type-safe database operations with SQLAlchemy 2.0
- **Alembic Migrations**: Database schema versioning and migrations
- **Email Services**: SMTP email sending with HTML template support
- **Docker Support**: Multi-stage Dockerfile with Docker Compose
- **Rich Logging**: Colorized console logging with file output
- **CORS Middleware**: Cross-origin resource sharing configuration
- **Environment Configuration**: Flexible environment variable management
- **Code Quality**: Ruff formatting and linting configuration
- **Security Ready**: Security framework structure with cryptographic utilities
- **Modern Python**: Python 3.13+ with UV package manager

## 📁 Project Structure

```
fastapi-template/
├── app/                          # Main application package
│   ├── api/                      # API layer
│   │   └── routes/
│   │       └── v1/               # API version 1
│   │           ├── controllers/  # Route handlers
│   │           ├── dto/          # Data Transfer Objects
│   │           └── providers/    # Dependency providers
│   ├── core/                     # Core application logic
│   │   ├── config/
│   │   │   └── env.py           # Environment configuration
│   │   ├── db/
│   │   │   ├── models.py        # Database models
│   │   │   ├── setup.py         # Database setup and connection
│   │   │   └── utils.py         # Database utilities
│   │   ├── logging/
│   │   │   └── log.py           # Rich logging utilities
│   │   ├── security/            # Security framework structure
│   │   └── services/
│   │       ├── email.py         # Email service
│   │       └── templating.py    # Jinja2 template rendering
│   ├── utils/                   # Utility functions
│   │   └── crypto.py            # Cryptographic utilities
│   └── app.py                   # FastAPI application factory
├── migrations/                  # Alembic migration files
│   ├── env.py                  # Alembic environment configuration
│   └── versions/               # Migration versions
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile                  # Multi-stage Docker build
├── main.py                     # Application entry point
├── pyproject.toml             # Project configuration and dependencies
├── ruff.toml                  # Code formatting and linting rules
├── alembic.ini                # Alembic configuration
└── .env.example               # Environment variables template
```

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.13+
- PostgreSQL (for production)
- UV package manager (recommended)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Frusadev/fastapi-template.git
   cd fastapi-template
   ```

2. **Set up environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

3. **Install dependencies**
   ```bash
   # Using UV (recommended)
   uv sync
   
   # Or using pip
   pip install -e .
   ```

4. **Set up database**
   ```bash
   # Initialize Alembic (if needed)
   alembic init migrations
   
   # Create migration
   alembic revision --autogenerate -m "Initial migration"
   
   # Apply migrations
   alembic upgrade head
   ```

5. **Run the application**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

### Docker Development

1. **Using Docker Compose**
   ```bash
   # Start all services (app + PostgreSQL)
   docker-compose up --build
   
   # Run in background
   docker-compose up -d --build
   ```

2. **Using Docker only**
   ```bash
   # Build image
   docker build -t fastapi-template .
   
   # Run container
   docker run -p 8000:8000 --env-file .env fastapi-template
   ```

## ⚙️ Configuration

### Environment Variables

Configure your application using the `.env` file:

```bash
# Database Configuration
DB_STRING="postgresql+psycopg2://username:password@db:5432/yourdb"
ALEMBIC_DB_URL="postgresql+psycopg2://username:password@db:5432/yourdb"

# Application Configuration
DEBUG=True
PORT=8000

# Email Configuration
EMAIL_APP_PASSWORD="your-app-password"
APP_EMAIL_ADDRESS="your-email@domain.com"
EMAIL_TEMPLATES_PATH="assets/templates/email/"
```

### Database Configuration

The template supports multiple database backends through SQLModel:

- **PostgreSQL** (recommended for production)
- **SQLite** (for development/testing)

Update the `DB_STRING` in your `.env` file according to your database choice.

## 📊 Database Operations

### Creating Models

Define your database models in `app/core/db/models.py`:

```python
from sqlmodel import SQLModel, Field
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    is_active: bool = Field(default=True)
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback to previous migration
alembic downgrade -1

# View migration history
alembic history
```

## 📧 Email Service

The template includes a comprehensive email service with template support:

### Basic Email

```python
from app.core.services.email import send_email

send_email(
    email="user@example.com",
    subject="Welcome!",
    message="Welcome to our service!",
    html=False
)
```

### Templated Email

```python
from app.core.services.email import send_templated_email

send_templated_email(
    email="user@example.com",
    subject="Welcome!",
    template_name="welcome",
    context={"name": "John Doe", "app_name": "MyApp"},
    fallback_message="Welcome to our service!"
)
```

### Email Templates

Create HTML templates in your configured templates directory:

```html
<!-- assets/templates/email/welcome.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to {{ app_name }}</title>
</head>
<body>
    <h1>Welcome, {{ name }}!</h1>
    <p>Thank you for joining {{ app_name }}.</p>
</body>
</html>
```

## 🔍 Logging

The template includes a rich logging system with colored console output and file logging:

```python
from app.core.logging.log import log_info, log_warning, log_error, log_success

log_info("Application started")
log_warning("This is a warning")
log_error("An error occurred")
log_success("Operation completed successfully")
```

## 🛡️ Security

The template includes a security framework structure for implementing authentication and authorization:

- Security framework structure in `app/core/security/`
- Cryptographic utilities in `app/utils/crypto.py` for ID and OTP generation
- CORS middleware configured for local development

### Cryptographic Utilities

The template includes secure utilities for generating IDs and one-time passwords:

```python
from app.utils.crypto import gen_id, gen_otp

# Generate secure URL-safe ID
user_id = gen_id(32)  # Returns 32-character URL-safe string

# Generate numeric OTP
otp_code = gen_otp(6)  # Returns 6-digit numeric string
```

## 🚀 API Development

### Creating Routes

1. **Create controllers** in `app/api/routes/v1/controllers/`
2. **Define DTOs** in `app/api/routes/v1/dto/`
3. **Set up providers** in `app/api/routes/v1/providers/`

Example controller:

```python
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.db.setup import create_db_session

router = APIRouter()

@router.get("/users")
async def get_users(session: Session = Depends(create_db_session)):
    # Your logic here
    return {"users": []}
```

### Register Routes

Add your routes to the main application in `app/app.py`:

```python
from app.api.routes.v1.controllers.users import router as users_router

app.include_router(users_router, prefix="/v1", tags=["users"])
```

## 🧪 Testing

The template is ready for testing with pytest:

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## 🔧 Development Tools

### Code Formatting and Linting

The project uses Ruff for code formatting and linting:

```bash
# Format code
ruff format

# Check for linting issues
ruff check

# Fix auto-fixable issues
ruff check --fix
```

### UV Package Manager

The template is optimized for UV, a fast Python package manager:

```bash
# Add new dependency
uv add package-name

# Add development dependency
uv add --dev package-name

# Update dependencies
uv sync --upgrade
```

## 📦 Dependencies

### Core Dependencies

- **FastAPI[standard]**: Web framework with all standard features
- **SQLModel**: Database ORM with type safety
- **Alembic**: Database migration tool
- **AsyncPG**: Async PostgreSQL driver
- **Psycopg2-binary**: PostgreSQL adapter
- **Uvloop**: High-performance event loop
- **Rich**: Rich console output
- **SlowAPI**: Rate limiting
- **Passlib[bcrypt]**: Password hashing
- **Piccolo**: Additional database tools
- **WebSockets**: WebSocket support
- **Python-dotenv**: Environment variable loading
- **Jinja2**: Template engine (for email templates)

## 🐳 Docker

### Multi-stage Dockerfile

The template includes an optimized multi-stage Dockerfile:

- **Builder stage**: Installs dependencies and builds the application
- **Production stage**: Minimal runtime image

### Docker Compose

Includes PostgreSQL database service with volume persistence.

## 📝 Environment Configuration

The `env.py` module provides type-safe environment variable access:

```python
from app.core.config.env import get_env

# Get environment variable with default
db_url = get_env("DB_STRING", "sqlite:///./test.db")

# Type-safe environment keys
debug = get_env("DEBUG", "False") == "True"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This template is provided as-is for educational and development purposes.

## 🔗 Useful Links

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Ruff Documentation](https://docs.astral.sh/ruff/)
- [UV Documentation](https://docs.astral.sh/uv/)
