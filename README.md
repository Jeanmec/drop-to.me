<p align="center">
  <a href="https://drop-to.me" target="_blank">
    <img src="./front/public/favicon.svg" width="120" alt="Drop-to.me logo" />
  </a>
</p>

<h1 align="center">
  <a href="https://drop-to.me/">Drop-to.me</a>
</h1>

<p align="center">Secure and anonymous file sharing and messaging, encrypted end to end.</p>

## What is DropToMe?

DropToMe lets users send files and messages between browsers with no account, no registration, and no data stored on any server. Everything is encrypted from one browser to the other: no server ever sees the content.

## How It Works

1. **You open the app** — the browser draws a random peer ID and connects to the server over Socket.IO.
2. **You join a room** — either automatically (users on the same public IP are grouped together) or manually via a 6-character room code.
3. **The server introduces peers** — Socket.IO tells each browser which peer IDs are in the room, and passes on the public keys two browsers exchange.
4. **Browsers link up** — each pair derives a secret key from those public keys, then opens a WebSocket to the relay, which pairs the two connections.
5. **Files and messages flow through the relay** — encrypted by the browsers themselves, so the relay cannot read them. The server is not involved.

```
┌───────────┐      Socket.IO: rooms, keys      ┌───────────┐
│ Browser A │◄────────────────────────────────►│  Server   │
└─────┬─────┘                                  └─────▲─────┘
      │                                              │
      │ WebSocket                          Socket.IO │
      │ encrypted files, messages        rooms, keys │
      ▼                                              ▼
┌───────────┐    WebSocket: encrypted files,   ┌───────────┐
│   Relay   │◄──────────── messages ──────────►│ Browser B │
└───────────┘                                  └───────────┘
```

**Socket.IO** is used only for: joining/leaving rooms, discovering other peers, passing on the public keys of each link, and anonymous statistics.
**The relay** carries all the actual data: files (chunked in 16 KB pieces), chat messages, and acknowledgements.

## Key Features

- **No account required** — open the link and start sharing.
- **End-to-end encrypted transfers** — files and messages go through a relay that cannot read them.
- **Automatic room grouping** — users on the same network are placed in the same room automatically (based on a hashed IP, no actual IP is shared).
- **Room codes** — create or join a room with a 6-character code. Shareable via URL (`?room=XXXXXX`).
- **Chunked file transfer** — large files are split into 16 KB chunks with progress tracking and acknowledgements.
- **Real-time chat** — text messaging alongside file sharing, over the same encrypted link.
- **Reconnection handling** — automatic reconnection with user feedback.
- **Anonymous statistics** — the server tracks aggregate counters only (number of connections, transfers, total size, messages). No content is ever stored.

## Architecture

This is an Nx monorepo with Yarn workspaces, containing four packages:

| Package | Stack | Role |
|---------|-------|------|
| **`front/`** | Next.js 15 (static export), React 19, TypeScript | UI, encryption, relay links, Socket.IO client |
| **`back/`** | NestJS 11, TypeScript | Socket.IO gateway (rooms, key exchange), statistics API |
| **`relay/`** | Node.js, ws, TypeScript | WebSocket relay that carries the encrypted exchange of two browsers |
| **`libs/shared/`** | TypeScript | Socket.IO and relay contracts shared by the packages, room code utilities |

### Backend services

| Service | Purpose |
|---------|---------|
| **NestJS** (port 3000) | Socket.IO gateway for rooms, key exchange and anonymous stats. Room membership and peer ID ownership tokens only live in its memory |
| **PostgreSQL** | Stores aggregate statistics only (connection count, transfer count, total size, message count) |

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
- [Relay README](./relay/README.md)

## License

Released under the [MIT License](./LICENSE).
