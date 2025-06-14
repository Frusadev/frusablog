# Deployment Guide

This guide covers various deployment options for the FrusaBlog full-stack application, from development to production environments.

## Overview

FrusaBlog consists of two main components:
- **Frontend**: Next.js 15 application
- **Backend**: FastAPI application with PostgreSQL database

## Development Deployment

### Quick Start with Docker Compose

The fastest way to get the entire stack running:

```bash
# Clone the repository
git clone https://github.com/frusadev/frusablog.git
cd frusablog

# Start all services
cd backend
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- FastAPI backend on port 8000
- Automatic database migrations

Then in another terminal:
```bash
cd frontend
pnpm install
pnpm dev
```

Frontend will be available at `http://localhost:3000`

### Manual Development Setup

#### Backend Setup
```bash
cd backend

# Install dependencies
uv sync

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
source .venv/bin/activate
alembic upgrade head

# Start the server
uv run main.py
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
pnpm install

# Set up environment
echo "NEXT_PUBLIC_SERVER_URL=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_API_VERSION=v1" >> .env.local

# Start development server
pnpm dev
```

## Production Deployment

### Architecture Options

#### Option 1: Separate Hosting (Recommended)
- **Frontend**: Vercel, Netlify, or static hosting
- **Backend**: VPS, AWS EC2, DigitalOcean, or cloud platforms
- **Database**: Managed PostgreSQL service

#### Option 2: Single Server
- All components on one VPS/server
- Docker Compose for orchestration
- Nginx reverse proxy

#### Option 3: Cloud Native
- **Frontend**: Vercel or AWS Amplify
- **Backend**: AWS Lambda, Google Cloud Run, or Azure Container Instances
- **Database**: AWS RDS, Google Cloud SQL, or Azure Database

## Backend Deployment

### Docker Deployment (Recommended)

#### Build Docker Image
```bash
cd backend

# Build production image
docker build -t frusablog-api:latest .

# Run container
docker run -d \
  --name frusablog-api \
  -p 8000:8000 \
  --env-file .env.production \
  frusablog-api:latest
```

#### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - backend

  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DB_STRING: postgresql+psycopg2://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      DEBUG: "False"
      EMAIL_APP_PASSWORD: ${EMAIL_APP_PASSWORD}
      APP_EMAIL_ADDRESS: ${APP_EMAIL_ADDRESS}
      FRONTEND_URL: ${FRONTEND_URL}
      BACKEND_URL: ${BACKEND_URL}
    depends_on:
      - db
    restart: unless-stopped
    volumes:
      - ./fs:/home/runner/app/fs
    networks:
      - backend
      - frontend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - frontend

volumes:
  postgres_data:

networks:
  backend:
    driver: bridge
  frontend:
    driver: bridge
```

#### Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:8000;
    }

    server {
        listen 80;
        server_name your-api-domain.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name your-api-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # API routes
        location / {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # File uploads
        client_max_body_size 10M;
    }
}
```

### VPS Deployment

#### Ubuntu/Debian Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-pip python3-venv git postgresql postgresql-contrib nginx

# Install UV package manager
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.cargo/env

# Create application user
sudo useradd -m -s /bin/bash frusablog
sudo su - frusablog

# Clone repository
git clone https://github.com/frusadev/frusablog.git
cd frusablog/backend

# Install dependencies
uv sync

# Set up environment
cp .env.example .env
# Edit .env with production values
```

#### PostgreSQL Setup
```bash
# Switch to postgres user
sudo su - postgres

# Create database and user
createdb frusablog
createuser --interactive frusablog
# Grant privileges in psql:
# ALTER USER frusablog WITH PASSWORD 'secure_password';
# GRANT ALL PRIVILEGES ON DATABASE frusablog TO frusablog;
```

#### Systemd Service
```ini
# /etc/systemd/system/frusablog-api.service
[Unit]
Description=FrusaBlog API
After=network.target postgresql.service

[Service]
Type=simple
User=frusablog
WorkingDirectory=/home/frusablog/frusablog/backend
Environment=PATH=/home/frusablog/frusablog/backend/.venv/bin
ExecStart=/home/frusablog/frusablog/backend/.venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable frusablog-api
sudo systemctl start frusablog-api
sudo systemctl status frusablog-api
```

### Cloud Platform Deployment

#### AWS EC2 with RDS
```bash
# Launch EC2 instance (Ubuntu 22.04 LTS)
# Create RDS PostgreSQL instance

# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker
sudo apt update
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker ubuntu

# Clone and deploy
git clone https://github.com/frusadev/frusablog.git
cd frusablog/backend

# Set up environment with RDS endpoint
echo "DB_STRING=postgresql+psycopg2://username:password@your-rds-endpoint:5432/frusablog" > .env.production

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

#### Google Cloud Run
```bash
# Build and push to Google Container Registry
cd backend

# Configure gcloud
gcloud auth configure-docker

# Build and tag image
docker build -t gcr.io/your-project-id/frusablog-api .
docker push gcr.io/your-project-id/frusablog-api

# Deploy to Cloud Run
gcloud run deploy frusablog-api \
  --image gcr.io/your-project-id/frusablog-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DB_STRING=your-db-string,DEBUG=False"
```

#### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway up
```

## Frontend Deployment

### Vercel Deployment (Recommended)

#### Automatic Deployment
1. Push your code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_SERVER_URL=https://your-api-domain.com
   NEXT_PUBLIC_API_VERSION=v1
   ```
4. Deploy automatically on every push

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

cd frontend

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SERVER_URL production
vercel env add NEXT_PUBLIC_API_VERSION production

# Redeploy with environment variables
vercel --prod
```

### Netlify Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

cd frontend

# Build the project
pnpm build

# Deploy to Netlify
netlify deploy --prod --dir=out

# Or use Netlify's GitHub integration
```

#### netlify.toml Configuration
```toml
[build]
  publish = "out"
  command = "pnpm build"

[build.environment]
  NEXT_PUBLIC_SERVER_URL = "https://your-api-domain.com"
  NEXT_PUBLIC_API_VERSION = "v1"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Static Export Deployment

For hosting on any static file server:

```javascript
// next.config.ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

export default nextConfig
```

```bash
# Build static files
pnpm build

# Upload 'out' directory to your static host
rsync -av out/ user@server:/var/www/frusablog/
```

### AWS S3 + CloudFront

```bash
# Build static files
pnpm build

# Install AWS CLI and configure
aws configure

# Sync to S3
aws s3 sync out/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Environment Configuration

### Backend Environment Variables

#### Development (.env)
```bash
# Database
DB_STRING=postgresql+psycopg2://postgres:password@localhost:5432/frusablog
ALEMBIC_DB_URL=postgresql+psycopg2://postgres:password@localhost:5432/frusablog

# Application
DEBUG=True
PORT=8000
STORAGE=fs/storage

# Email (required for authentication)
EMAIL_APP_PASSWORD=your-gmail-app-password
APP_EMAIL_ADDRESS=your-email@gmail.com
EMAIL_TEMPLATES_PATH=assets/templates/email/

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

#### Production (.env.production)
```bash
# Database (use managed PostgreSQL service)
DB_STRING=postgresql+psycopg2://user:pass@your-db-host:5432/frusablog
ALEMBIC_DB_URL=postgresql+psycopg2://user:pass@your-db-host:5432/frusablog

# Application
DEBUG=False
PORT=8000
STORAGE=/app/storage

# Email
EMAIL_APP_PASSWORD=${EMAIL_APP_PASSWORD}
APP_EMAIL_ADDRESS=${APP_EMAIL_ADDRESS}
EMAIL_TEMPLATES_PATH=assets/templates/email/

# URLs
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-api-domain.com
```

### Frontend Environment Variables

#### Development (.env.local)
```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
```

#### Production
```bash
NEXT_PUBLIC_SERVER_URL=https://your-api-domain.com
NEXT_PUBLIC_API_VERSION=v1
```

## Database Setup

### PostgreSQL Installation and Configuration

#### Local Development
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database
sudo -u postgres createdb frusablog
sudo -u postgres createuser -s yourusername
```

#### Managed Database Services

**AWS RDS:**
```bash
# Create RDS instance via AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier frusablog-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 20
```

**DigitalOcean Managed Database:**
```bash
# Create via DigitalOcean control panel
# Get connection string and update environment variables
```

**Google Cloud SQL:**
```bash
gcloud sql instances create frusablog-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1
```

### Database Migrations

```bash
# Run migrations in production
cd backend

# Apply all pending migrations
alembic upgrade head

# Rollback if needed
alembic downgrade -1

# Check current migration status
alembic current
```

## SSL/TLS Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-api-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Certificate

```bash
# Generate self-signed certificate (development only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# For production, use certificates from your SSL provider
```

## Monitoring and Logging

### Application Monitoring

#### Sentry Integration
```python
# Backend
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
)
```

```javascript
// Frontend
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

#### Health Checks
```python
# Backend health endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }
```

### Log Management

#### Centralized Logging
```bash
# Install log management tools
sudo apt install rsyslog logrotate

# Configure log rotation
sudo nano /etc/logrotate.d/frusablog
```

```bash
# /etc/logrotate.d/frusablog
/var/log/frusablog/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 frusablog frusablog
    postrotate
        systemctl reload frusablog-api
    endscript
}
```

## Backup Strategy

### Database Backups

#### Automated PostgreSQL Backups
```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="frusablog"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump $DB_NAME > $BACKUP_DIR/frusablog_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/frusablog_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: frusablog_$DATE.sql.gz"
```

```bash
# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup-db.sh
```

### File Storage Backups

```bash
#!/bin/bash
# backup-files.sh

DATE=$(date +%Y%m%d_%H%M%S)
SOURCE_DIR="/app/fs/storage"
BACKUP_DIR="/backups/files"

mkdir -p $BACKUP_DIR

# Create tarball of uploaded files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz -C $SOURCE_DIR .

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "File backup completed: files_$DATE.tar.gz"
```

## Scaling Considerations

### Horizontal Scaling

#### Load Balancing
```nginx
# nginx load balancer configuration
upstream api_servers {
    server api1:8000;
    server api2:8000;
    server api3:8000;
}

server {
    listen 80;
    location / {
        proxy_pass http://api_servers;
    }
}
```

#### Database Read Replicas
```python
# Multiple database connections
class DatabaseManager:
    def __init__(self):
        self.write_engine = create_engine(WRITE_DB_URL)
        self.read_engine = create_engine(READ_DB_URL)
    
    def get_read_session(self):
        return Session(self.read_engine)
    
    def get_write_session(self):
        return Session(self.write_engine)
```

### Caching Layer

#### Redis Integration
```python
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(expiration=3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, expiration, json.dumps(result))
            return result
        return wrapper
    return decorator

@cache_result(expiration=1800)  # 30 minutes
async def get_featured_posts():
    # Expensive database operation
    pass
```

## Security Checklist

### Production Security

- [ ] **HTTPS**: SSL/TLS certificates configured
- [ ] **Environment Variables**: Sensitive data in environment variables, not code
- [ ] **Database**: Strong passwords, restricted access
- [ ] **CORS**: Properly configured allowed origins
- [ ] **Rate Limiting**: Implemented on authentication endpoints
- [ ] **File Upload**: Type and size restrictions
- [ ] **SQL Injection**: Using parameterized queries
- [ ] **XSS Protection**: Content Security Policy headers
- [ ] **Secrets Management**: Using secret management service
- [ ] **Regular Updates**: Dependencies kept up to date
- [ ] **Backup Strategy**: Regular automated backups
- [ ] **Monitoring**: Error tracking and alerting
- [ ] **Access Logs**: Request logging enabled
- [ ] **Firewall**: Only necessary ports open
- [ ] **User Permissions**: Principle of least privilege

### Security Headers

```python
# FastAPI security middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Test connection
psql -h localhost -U username -d frusablog
```

#### Frontend Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
pnpm install

# Check environment variables
env | grep NEXT_PUBLIC
```

#### API Server Issues
```bash
# Check service status
sudo systemctl status frusablog-api

# Check logs
sudo journalctl -u frusablog-api -f

# Check disk space
df -h

# Check memory usage
free -h
```

### Performance Issues

#### Database Query Optimization
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Add indexes for frequently queried columns
CREATE INDEX idx_posts_published_created 
ON post(published, created_at DESC) 
WHERE published = true;
```

#### Application Performance
```python
# Add request timing middleware
import time

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

This comprehensive deployment guide covers everything from development setup to production deployment with multiple hosting options, security considerations, and troubleshooting steps.
