# 📦 Backend [Drop-to.me](https://drop-to.me/)

This project is developed in **TypeScript** using the **NestJS** framework.  
It groups browsers into rooms, passes on the public keys they exchange, issues their relay tokens and keeps anonymous statistics in **PostgreSQL**.  
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

RELAY_AUTH_SECRET=xxx
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

- **RELAY_AUTH_SECRET**  
  Secret shared with the relay (`relay/`). The server signs with it the relay token, valid for one minute, that each browser of a room asks for when it opens a link. The server does not start without it.

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

## 📡 Relay

Browsers send their files and messages through the [relay](../relay/README.md), which only sees what they encrypted.

A browser asks the server for a token when it opens a link: the expiry time in epoch milliseconds, one minute ahead, a dot, and the base64url HMAC-SHA256 of that expiry under `RELAY_AUTH_SECRET`. The relay checks it with the same secret. The front names the relay in `NEXT_PUBLIC_RELAY_URL`.

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

- Port 3000 is used for the NestJS backend (Socket.IO: rooms, key exchange and statistics)

## 🗂 Project Structure

- src/signal/ : Socket.IO gateway (rooms, key exchange), peer ID ownership, places held during a file selection and relay tokens
- src/stats/ : statistics entities and service
- src/database/ : database connection
- .env : Local environment variables
- .env.example : Example configuration

## 🧩 Services Used

- NestJS : TypeScript backend framework
- Socket.IO : Real-time communication over WebSocket
- PostgreSQL : Relational database
- TypeORM : ORM for PostgreSQL
