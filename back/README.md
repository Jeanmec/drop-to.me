# 📦 Backend [Drop-to.me](https://drop-to.me/)

This project is developed in **TypeScript** using the **NestJS** framework.  
It groups browsers into rooms, relays their WebRTC signaling and keeps anonymous statistics in **PostgreSQL**.  
All client communication is handled via **Socket.IO** (WebSocket).

## 🚀 Prerequisites

- Node.js 20 or later (the Docker images use 22)
- Yarn 1 (the repository is a Yarn workspace)
- PostgreSQL
- or Docker

## ⚙️ Installation

Install the dependencies of the whole workspace, from the repository root:

```
yarn install
```

## 🛠 Environment Variables Configuration

An `.env.example` file is provided. Copy it to create your `.env` file:

```
cp .env.example .env
```

Fill in the environment variables with your values:

```env
DATABASE_URL=postgres://user:postgres@xxx:5432/xxx

IP_HASH_SECRET=xxx

CORS_ACCEPTED_ORIGINS=http://localhost:3001
```

The variables are read from the environment of the process: Docker Compose loads `.env`, a bare `node` or `nest` command does not.

### Environment Variables Explanation

- **DATABASE_URL**  
  Configures the PostgreSQL database connection.  
  The stored data includes:

  - Number of connections
  - Number of file transfers
  - Total size of transferred files
  - Number of messages sent  
    Note: The actual content of the messages or files is NOT stored in the database.

- **IP_HASH_SECRET**  
  Secret key used to derive the default room of a network from its public IP address. Without it a random secret is drawn at each start.

- **CORS_ACCEPTED_ORIGINS**  
  Defines the accepted origins for standard HTTP CORS requests.

- **PORT** (optional)  
  Port the server listens on, 3000 by default.

- **NODE_ENV** (optional)  
  When set to `production`, TypeORM no longer synchronises the tables with the entities at startup.

## 🗄 Database schema

The tables are created by TypeORM from the entities of `src/stats/entities`.

That synchronisation does not convert a column whose type changes in an entity: it drops the column and adds it again. On a table that already has rows the server then fails to start, logging `Unable to connect to the database`.

Alter the column in the database before starting the new version. A database created while `fileSize` was an `integer` needs:

```sql
ALTER TABLE file_transfers ALTER COLUMN "fileSize" TYPE bigint;
```

## ▶️ Run the Project

From the repository root, development mode:

```
yarn dev:back
```

Production mode:

```
yarn build:back
node back/dist/main
```

## 🐳 Running with Docker

This project includes Docker support for easy deployment.

### Using Docker Compose

To start the project with Docker Compose:

```bash
docker-compose -f docker-compose.yml up
```

This will start the backend with the configuration from your `.env` file. The build context is the repository root, since the image also builds `libs/shared`.

### Using Docker directly

To run only the backend with Docker:

```bash
docker run --env-file .env -p 3000:3000 droptome-back
```

**Note:**

- Port 3000 is used for the NestJS backend (Socket.IO: rooms, WebRTC signaling and statistics)

## 🗂 Project Structure

- src/signal/ : Socket.IO gateway (rooms, signaling relay) and peer ID ownership
- src/stats/ : statistics entities and service
- src/database/ : database connection
- .env : Local environment variables
- .env.example : Example configuration

## 🧩 Services Used

- NestJS : TypeScript backend framework
- Socket.IO : Real-time communication over WebSocket
- PostgreSQL : Relational database
- TypeORM : ORM for PostgreSQL
