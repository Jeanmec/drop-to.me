# 🌐 Frontend [Drop-to.me](https://drop-to.me/)

This project is built with **Next.js** (React framework) in **TypeScript**.  
It communicates with the NestJS backend via **WebSocket** and uses **PeerJS** for peer-to-peer connections.

## 🚀 Prerequisites

- Node.js (version 18+ recommended, 22.04 if using Nixpacks)
- npm or yarn
- Backend URL (NestJS WebSocket server)
- PeerJS server URL

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
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_LOADING_SCREEN_DURATION=3000
NEXT_PUBLIC_WEBSITE_NAME=
NEXT_PUBLIC_GITHUB_URL=https://github.com/Jeanmec
NIXPACKS_NODE_VERSION=22.04
```

### Environment Variables Explanation

- **NEXT_PUBLIC_BACKEND_URL**  
  URL of the NestJS backend server (WebSocket and PeerJS are integrated on the same server).

- **NEXT_PUBLIC_LOADING_SCREEN_DURATION**  
  Time in milliseconds that the loading animation will be displayed before triggering the rest of the animations.

- **NEXT_PUBLIC_WEBSITE_NAME**  
  Name of the website (used in titles, metadata, and branding).

- **NEXT_PUBLIC_GITHUB_URL**  
  GitHub repository URL of the project.

- **NIXPACKS_NODE_VERSION** (optional)  
  Node.js version to use when deploying with Nixpacks (e.g., `22.04`).

## ▶️ Running the Project

Development mode:

```
npm run dev
```

Production mode:

```
npm run build
npm run start
```

### Running with Docker:

A `Dockerfile` is included to run the frontend in a container.

Build the Docker image:

```
docker build -t droptome-frontend .
```

Run the container:

```
docker run -p 3000:3000 --env-file .env droptome-frontend
```

## 🗂 Project Structure

- src/app/ : Next.js app router pages and routes
- src/components/ : Reusable UI components
- src/contexts/ : React contexts (WebSocket, PeerJS providers)
- src/services/ : Service layer for WebSocket and peer communication
- src/stores/ : State management stores
- src/styles/ : Global and component-specific styles
- .env : Local environment variables
- .env.example : Example configuration
