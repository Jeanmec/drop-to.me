<p align="center">
  <a href="https://drop-to.me" target="_blank">
    <img src="https://drop-to.me/favicon.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<h1 align="center">
  <a href="https://drop-to.me/">Drop-to.me</a>
</h1>

# Project Overview

**DropToMe** is a secure and anonymous peer-to-peer communication platform that allows users to send messages and files without any data passing through a central server.

## Key Features

- **Anonymous Communication**: Send messages and files without requiring registration or personal information
- **Peer-to-Peer Technology**: Direct connections between users using WebRTC and PeerJS - no intermediary storage
- **Privacy First**: All messages and files are transmitted directly between peers - nothing is stored on servers
- **Real-time Transfer**: Instant file sharing and messaging through peer-to-peer connections
- **Network Detection**: Automatically creates private rooms for users on the same local network

## Architecture

DropToMe is an application divided into two main parts: a **backend** and a **frontend**.

- **Backend**: Developed in **TypeScript** using the **NestJS** framework with an integrated **PeerJS server**, it handles connection orchestration. It uses **PostgreSQL** to store anonymous statistics (number of connections, transfers, etc.) and **Redis** for temporary session data management.
- **Frontend**: Built with **Next.js** (based on React) in **TypeScript**, it provides the user interface and establishes peer-to-peer connections with other users. WebSocket is used only for signaling, while all messages and files are transferred directly via peer-to-peer connections.

---

### Getting Started

For detailed instructions on installation, environment variable configuration, and deployment options for each service, please refer to their specific README files:

- [Backend README](./back/README.md) - Setup and run the NestJS backend with integrated PeerJS server
- [Frontend README](./front/README.md) - Setup and run the Next.js frontend application
