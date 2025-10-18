# 📦 Backend [Drop-to.me](https://drop-to.me/)

This project is developed in **TypeScript** using the **NestJS** framework with an integrated **PeerJS server**.  
It integrates **PostgreSQL** and **Redis** services for persistence and caching.  
All client communication is handled via **WebSocket**.

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

```env
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

This project includes Docker support for easy deployment.

### Using Docker Compose

To start the project with Docker Compose:

```bash
docker-compose -f docker-compose.yml up
```

This will start all services (backend, PostgreSQL, Redis, and PeerJS server) with the configuration from your `.env` file.

### Using Docker directly

To run only the backend with Docker:

```bash
docker run --env-file .env -p 3000:3000 droptome-back
```

**Note:**

- Port 3000 is used for the NestJS backend (WebSocket communication and integrated PeerJS server on /peerjs path)

## 🗂 Project Structure

- src/ : Main source code (modules, services, controllers)
- .env : Local environment variables
- .env.example : Example configuration

## 🧩 Services Used

- NestJS : TypeScript backend framework
- PeerJS : Integrated peer-to-peer server
- WebSocket : Real-time communication protocol
- PostgreSQL : Relational database
- Redis : Cache and key-value store
- TypeORM : ORM for PostgreSQL
