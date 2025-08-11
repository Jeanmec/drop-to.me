# 📦 Backend [Drop-to.me](https://drop-to.me/)

This project is developed in **TypeScript** using the **NestJS** framework.  
It integrates **PostgreSQL** and **Redis** services for persistence and caching.

## 🚀 Prerequisites

- Node.js (version 18+ recommended)
- npm or yarn
- PostgreSQL
- Redis
- or Docker

## ⚙️ Installation


Install dependencies:

```
npm install
```

## 🛠 Environment Variables Configuration

An `.env.example` file is provided. Copy it to create your `.env` file:

```
cp .env.example .env
```

Fill in the environment variables with your values:

```
DATABASE_URL=postgres://user:postgres@xxx:5432/xxx
REDIS_URL=redis://user:password@xxx:6379/0

IP_HASH_SECRET=xxx

CORS_ACCEPTED_ORIGINS=http://localhost:3001
CORS_WEB_SOCKET_ORIGINS=http://localhost:3001
```

### Environment Variables Explanation

- **DATABASE_URL**  
  Configures the PostgreSQL database connection.  
  The stored data includes:
  - Number of connections
  - Number of file transfers
  - Total size of transferred files
  - Number of messages sent  
  Note: The actual content of the messages or files is NOT stored in the database.

- **REDIS_URL**  
  Configures the Redis connection.  
  Redis is used to temporarily store message data.

- **IP_HASH_SECRET**  
  Secret key used to generate private rooms between users on the same network.

- **CORS_ACCEPTED_ORIGINS**  
  Defines the accepted origins for standard HTTP CORS requests.

- **CORS_WEB_SOCKET_ORIGINS**  
  Defines the accepted origins for WebSocket connections.

## ▶️ Run the Project

Development mode:

```
npm run dev
```

Production mode:

```
npm run build
npm run start
```


## 🐳 Running with Docker

This project includes two Dockerfiles and two docker-compose files for flexibility between development and production:

- `Dockerfile` for production image
- `Dockerfile.dev` for development image (with live reload, etc.)
- `docker-compose.yml` for production containers orchestration
- `docker-compose.dev.yml` for development environment overrides

### Using Docker Compose for Development

To start the project in development mode with Docker, run:

```
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```


This command merges the base `docker-compose.yml` configuration with the overrides in `docker-compose.dev.yml`. It builds the images if needed and starts the containers with development settings such as mounting source files for live reload, exposing debug ports, and using `.env.dev` environment variables.

### Using Docker Compose for Production

To start the project in production mode, simply run:

```
docker-compose up --build -d
```

This will use the default `docker-compose.yml` file and the `.env` environment variables.

## 🗂 Project Structure

- src/ : Main source code (modules, services, controllers)
- .env : Local environment variables
- .env.example : Example configuration

## 🧩 Services Used

- NestJS : TypeScript backend framework
- PostgreSQL : Relational database
- Redis : Cache and key-value store
- TypeORM : ORM for PostgreSQL
