<p align="center">
  <a href="https://drop-to.me" target="_blank">
    <img src="https://drop-to.me/favicon.svg" width="120" alt="DropToMe Logo" />
  </a>
</p>

<h1 align="center">
  <a href="https://drop-to.me/">Drop-to.me</a>
</h1>

<p align="center">Secure and anonymous peer-to-peer file sharing and messaging.</p>

## What is DropToMe?

DropToMe lets users send files and messages directly between browsers with no account, no registration, and no data stored on any server. Everything goes peer-to-peer: the server only connects users together, it never sees the content.

## How It Works

1. **You open the app** — a PeerJS connection is established to get a unique peer ID.
2. **You join a room** — either automatically (users on the same public IP are grouped together) or manually via a 6-character room code.
3. **The server introduces peers** — Socket.IO tells each browser which peer IDs are in the room.
4. **Browsers connect directly** — WebRTC data channels are opened between peers using the PeerJS IDs.
5. **Files and messages flow peer-to-peer** — all data goes directly between browsers. The server is not involved.

```
┌──────────┐         Socket.IO          ┌──────────┐
│ Browser A│◄──── signaling only ──────►│  Server  │
└────┬─────┘                            └────┬─────┘
     │              WebRTC (P2P)             │
     │◄═══ files, messages, chat ═══►│       │
┌────┴─────┐                         │  Socket.IO
│ Browser B│◄── signaling only ──────┘
└──────────┘
```

**Socket.IO** is used only for: joining/leaving rooms, discovering other peers, and anonymous statistics.
**WebRTC (PeerJS)** carries all the actual data: files (chunked in 16 KB pieces), chat messages, and acknowledgements.

## Key Features

- **No account required** — open the link and start sharing.
- **Peer-to-peer transfers** — files and messages go directly between browsers, never through a server.
- **Automatic room grouping** — users on the same network are placed in the same room automatically (based on a hashed IP, no actual IP is shared).
- **Room codes** — create or join a room with a 6-character code. Shareable via URL (`?room=XXXXXX`).
- **Chunked file transfer** — large files are split into 16 KB chunks with progress tracking and acknowledgements.
- **Real-time chat** — text messaging alongside file sharing, all peer-to-peer.
- **Reconnection handling** — automatic PeerJS reconnection with user feedback.
- **Anonymous statistics** — the server tracks aggregate counters only (number of connections, transfers, total size, messages). No content is ever stored.

## Network Usage

Your browser may ask for permission to discover devices on your local network. This is triggered by WebRTC's ICE process, which looks for the best connection path between peers (including local network addresses).

**This permission is entirely optional.** If denied, connections are established through public IP addresses via STUN servers. The app works the same way — the only difference is that two peers on the same LAN won't benefit from a direct local connection.

## Architecture

This is an Nx monorepo with Yarn workspaces, containing three packages:

| Package | Stack | Role |
|---------|-------|------|
| **`front/`** | Next.js 15, React 19, TypeScript | UI, PeerJS client, Socket.IO client |
| **`back/`** | NestJS 11, TypeScript | Socket.IO gateway, PeerJS server, statistics API |
| **`libs/shared/`** | TypeScript | Shared types and utility functions |

### Backend services

| Service | Purpose |
|---------|---------|
| **NestJS** (port 3000) | Socket.IO gateway for room signaling + anonymous stats |
| **PeerJS server** (port 9000) | WebRTC signaling server for peer discovery |
| **PostgreSQL** | Stores aggregate statistics only (connection count, transfer count, total size, message count) |
| **Redis** | Temporary room membership mapping (socket ID → peer ID, TTL 1 hour) |

### What the server stores

| Stored | Not stored |
|--------|------------|
| Number of connections | File contents |
| Number of file transfers | Message contents |
| Total bytes transferred | User identity |
| Number of messages sent | IP addresses (only hashed for room grouping) |

## Getting Started

For setup instructions, environment variables, and deployment:

- [Backend README](./back/README.md)
- [Frontend README](./front/README.md)
