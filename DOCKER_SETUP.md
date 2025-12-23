# Docker Setup for Frig-oh

This guide explains how to run the Frig-oh application using Docker.

## Prerequisites

- Docker Desktop installed on your system
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Create Environment File

Create a `.env` file in the project root with the following variables:

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password

# Backend Configuration
SECRET_KEY=your_secret_key_here_change_in_production
GOOGLE_API_KEY=your_google_api_key_here

# Frontend Configuration (Optional)
REACT_APP_API_URL=http://localhost:8000
```

### 2. Build and Run

Run the following command to start all services:

```bash
docker-compose up --build
```

Or run in detached mode (background):

```bash
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MongoDB**: localhost:27017

## Services

The application consists of three services:

### 1. Frontend (React + Nginx)

- Runs on port 80
- Built using multi-stage Docker build
- Served through Nginx for optimal performance
- Includes caching and compression

### 2. Backend (FastAPI)

- Runs on port 8000
- Python 3.12 with FastAPI
- Hot-reload enabled in development

### 3. MongoDB

- Runs on port 27017
- Persistent data storage using Docker volumes
- Health checks configured

## Common Commands

### Start services

```bash
docker-compose up
```

### Stop services

```bash
docker-compose down
```

### View logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Rebuild services

**Complete rebuild (recommended):**

```bash
docker-compose down
docker-compose up --build
```

**More thorough rebuild (clears everything):**

```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove any cached images
docker-compose build --no-cache

# Start fresh
docker-compose up
```

**Quick restart (without rebuild):**

```bash
docker-compose restart
```

### Remove volumes (warning: deletes data)

```bash
docker-compose down -v
```

### Access container shell

```bash
# Backend
docker exec -it frig-oh-backend sh

# Frontend
docker exec -it frig-oh-frontend sh

# MongoDB
docker exec -it frig-oh-mongodb mongosh
```

## Development Mode

For development with hot-reload:

1. Backend: The backend is configured with `--reload` flag by default
2. Frontend: For development, you might want to run frontend separately with `npm start`

To use the development setup:

```bash
# Start only backend and database
docker-compose up mongodb backend

# Run frontend locally
npm start
```

## Production Deployment

For production:

1. **Update environment variables** in `.env`:
   - Use strong passwords
   - Change SECRET_KEY to a secure random value
   - Configure proper GOOGLE_API_KEY

2. **Remove development features**:
   - Edit [docker-compose.yml](docker-compose.yml) to remove volume mounts
   - Remove `--reload` flag from backend command

3. **Use production build**:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

## Troubleshooting

### Port already in use

If ports 80, 8000, or 27017 are already in use, edit [docker-compose.yml](docker-compose.yml) to change the ports:

```yaml
ports:
  - "8080:80" # Frontend
  - "8001:8000" # Backend
  - "27018:27017" # MongoDB
```

### Backend can't connect to MongoDB

Ensure MongoDB is healthy before backend starts. The `depends_on` configuration handles this automatically.

### Permission issues

If you encounter permission issues on Linux/Mac:

```bash
sudo chown -R $USER:$USER .
```

### Clear Docker cache

If builds are failing:

```bash
docker system prune -a
docker volume prune
```

## Network Architecture

All services communicate through a custom bridge network (`frig-oh-network`):

- Frontend → Backend: via service name `backend`
- Backend → MongoDB: via service name `mongodb`
- External access through exposed ports

## Data Persistence

MongoDB data is persisted using Docker volumes:

- `mongodb_data`: Database files
- `mongodb_config`: Configuration files

Data persists even when containers are stopped or removed (unless you use `docker-compose down -v`).

## Health Checks

All services include health checks:

- MongoDB: Ping command every 10s
- Backend: HTTP health endpoint every 30s
- Frontend: HTTP check every 30s

## Security Notes

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Change default passwords** in production
3. **Use secrets management** for production (Docker secrets, environment variables from CI/CD)
4. **Enable HTTPS** in production with reverse proxy (nginx, Traefik)
5. **Limit exposed ports** in production

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
