# 🌐 Frontend [Drop-to.me](https://drop-to.me/)

This project is built with **Next.js** (React framework) in **TypeScript**.  
It talks to the NestJS backend over **Socket.IO** and connects browsers to each other with native **WebRTC** data channels.

## 🚀 Prerequisites

- Node.js 20 or later (22.04 if using Nixpacks)
- Yarn 1 (the repository is a Yarn workspace)
- Backend URL (NestJS Socket.IO server)

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
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_STUN_URLS=stun:stun.l.google.com:19302,stun:global.stun.twilio.com:3478
NEXT_PUBLIC_TURN_URL=
NEXT_PUBLIC_TURN_USERNAME=
NEXT_PUBLIC_TURN_CREDENTIAL=
NEXT_PUBLIC_WEBSITE_NAME=drop-to.me
NEXT_PUBLIC_GITHUB_URL=https://github.com/Jeanmec/drop-to.me
NEXT_PUBLIC_AUTHOR_GITHUB_URL=https://github.com/Jeanmec
NIXPACKS_NODE_VERSION=22.04
```

All `NEXT_PUBLIC_*` values are inlined at build time (`next build`, Docker, Nixpacks): changing one requires a rebuild, not a restart.

The build is a static export written to `out/`; `yarn start` serves it on the port given by `PORT` (3000 by default).

### Environment Variables Explanation

- **NEXT_PUBLIC_BACKEND_URL**  
  URL of the NestJS backend server (Socket.IO signaling).

- **NEXT_PUBLIC_STUN_URLS**  
  Comma-separated STUN servers the browsers use to find a route to each other. The terms of use name them.

- **NEXT_PUBLIC_WEBSITE_NAME**  
  Name of the website (used in the page and in the terms of use).

The build fails when one of the three variables above is missing or malformed.

- **NEXT_PUBLIC_TURN_URL**, **NEXT_PUBLIC_TURN_USERNAME**, **NEXT_PUBLIC_TURN_CREDENTIAL** (optional)  
  TURN relay used when two browsers cannot reach each other directly. The credentials are visible in the bundle.

- **NEXT_PUBLIC_GITHUB_URL**  
  GitHub repository URL of the project, used by the footer "Get the source code" link, the FAQ and the terms of use (license and issue links). When empty, these links are hidden.

- **NEXT_PUBLIC_AUTHOR_GITHUB_URL**  
  Author profile URL, used by the "My Github" footer link. The link is hidden when empty.

- **NIXPACKS_NODE_VERSION** (optional)  
  Node.js version to use when deploying with Nixpacks (e.g., `22.04`).

## ▶️ Running the Project

From the repository root, development mode:

```
yarn dev:front
```

Production mode:

```
yarn build:front
yarn workspace front start
```

### Running with Docker:

A `Dockerfile` is included to run the frontend in a container. Its build context is the repository root, and the build reads `front/.env`.

Build the Docker image, from the repository root:

```
docker build -f front/Dockerfile -t droptome-frontend .
```

Run the container:

```
docker run -p 3000:3000 droptome-frontend
```

## 🗂 Project Structure

- src/app/ : Next.js app router pages (the application and the terms of use)
- src/components/ : UI components, one folder per domain
- src/hooks/ : React hooks
- src/services/ : Socket.IO session, WebRTC connections and transfers
- src/stores/ : State management stores
- src/schemas/ : Validation of the messages exchanged between browsers
- src/styles/ : Theme and global styles
- src/types/ : Shared types and enums
- src/utils/ : Pure helpers
- .env : Local environment variables
- .env.example : Example configuration
