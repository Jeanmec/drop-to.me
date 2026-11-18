<p align="center">
  <a href="https://drop-to.me" target="_blank">
    <img src="./front/public/favicon.svg" width="120" alt="Drop-to.me logo" />
  </a>
</p>

<h1 align="center">
  <a href="https://drop-to.me/">Drop-to.me</a>
</h1>

<p align="center">Secure and anonymous peer-to-peer file sharing and messaging.</p>

## What is DropToMe?

DropToMe lets users send files and messages directly between browsers with no account, no registration, and no data stored on any server. Everything goes peer-to-peer: the server only connects users together, it never sees the content.

## How It Works

1. **You open the app** — the browser draws a random peer ID and connects to the server over Socket.IO.
2. **You join a room** — either automatically (users on the same public IP are grouped together) or manually via a 6-character room code.
3. **The server introduces peers** — Socket.IO tells each browser which peer IDs are in the room, and relays the WebRTC offers, answers and ICE candidates between them.
4. **Browsers connect directly** — WebRTC data channels are opened between peers.
5. **Files and messages flow peer-to-peer** — all data goes directly between browsers. The server is not involved. When no direct route exists, an optional relay carries the data, encrypted by the browsers from one end to the other.

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

**Socket.IO** is used only for: joining/leaving rooms, discovering other peers, relaying WebRTC signaling, and anonymous statistics.
**WebRTC** carries all the actual data: files (chunked in 16 KB pieces), chat messages, and acknowledgements. Between two browsers that cannot reach each other, the same data goes through the relay, encrypted by the browsers.

## Key Features

- **No account required** — open the link and start sharing.
- **Peer-to-peer transfers** — files and messages go directly between browsers. An optional relay carries them, encrypted end to end, when two browsers cannot reach each other.
- **Automatic room grouping** — users on the same network are placed in the same room automatically (based on a hashed IP, no actual IP is shared).
- **Room codes** — create or join a room with a 6-character code. Shareable via URL (`?room=XXXXXX`).
- **Chunked file transfer** — large files are split into 16 KB chunks with progress tracking and acknowledgements.
- **Real-time chat** — text messaging alongside file sharing, all peer-to-peer.
- **Reconnection handling** — automatic reconnection with user feedback.
- **Anonymous statistics** — the server tracks aggregate counters only (number of connections, transfers, total size, messages). No content is ever stored.

## Network Usage

Your browser may ask for permission to discover devices on your local network. This is triggered by WebRTC's ICE process, which looks for the best connection path between peers (including local network addresses).

**This permission is optional.** If denied, the browsers try to reach each other through their public addresses, found with the STUN servers. Not every router allows that between two devices of the same network: when no direct route exists, the transfer needs the optional relay.

## Architecture

This is an Nx monorepo with Yarn workspaces, containing four packages:

| Package | Stack | Role |
|---------|-------|------|
| **`front/`** | Next.js 15 (static export), React 19, TypeScript | UI, WebRTC connections, Socket.IO client |
| **`back/`** | NestJS 11, TypeScript | Socket.IO gateway (rooms, signaling relay), statistics API |
| **`relay/`** | Node.js, ws, TypeScript | Optional WebSocket relay between two browsers that cannot reach each other |
| **`libs/shared/`** | TypeScript | Socket.IO and relay contracts shared by the packages, room code utilities |

### Backend services

| Service | Purpose |
|---------|---------|
| **NestJS** (port 3000) | Socket.IO gateway for rooms, WebRTC signaling relay and anonymous stats. Room membership and peer ID ownership tokens only live in its memory |
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

## License

Released under the [MIT License](./LICENSE).
