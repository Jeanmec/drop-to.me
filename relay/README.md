# 📡 Relay [Drop-to.me](https://drop-to.me/)

This project is developed in **TypeScript** on **Node.js** with the **ws** library.  
It carries every file and message two browsers exchange: it pairs the two WebSocket connections that present the same link ID, then forwards every frame from one to the other. It reads, stores and logs nothing.

The browsers encrypt everything they send through it (ECDH P-256 key agreement through the backend, then AES-GCM), so the relay only sees ciphertext.

## 🚀 Prerequisites

- Node.js 18 or later
- Yarn 1 (the repository is a Yarn workspace)
- A proxy that terminates TLS in front of it, such as Caddy: the site is served over HTTPS, so browsers only open `wss://` connections

## 🛠 Environment Variables

```env
RELAY_AUTH_SECRET=xxx

PORT=8080

HOST=127.0.0.1
```

- **RELAY_AUTH_SECRET**  
  Same value as the `RELAY_AUTH_SECRET` of the backend, which issues the tokens. The relay does not start without it.

- **PORT** (optional)  
  Port the relay listens on, 8080 by default.

- **HOST** (optional)  
  Address the relay listens on, every interface by default. `127.0.0.1` when the TLS proxy runs on the same host.

## 🔌 Protocol

1. The browser opens the WebSocket and sends one text frame, `{"linkId":"…","token":"…"}`. The browser gets the token from the backend just before, valid for one minute: the expiry time in epoch milliseconds, a dot, and the base64url HMAC-SHA256 of that expiry under `RELAY_AUTH_SECRET`.
2. When the second browser of the same link arrives, the relay sends the text frame `paired` to both.
3. From then on, every frame goes unchanged to the other browser. When one side closes, the relay closes the other.

An invalid or expired token, a frame sent before `paired`, or a frame over 1 MiB closes the connection. At most 256 connections wait for their pair; one more closes the one that has waited the longest.

## ▶️ Run the Project

From the repository root:

```
yarn install
yarn build:relay
RELAY_AUTH_SECRET=xxx node relay/dist/main
```

On a server, the relay only needs `relay/dist`, the `ws` and `zod` packages, and the built shared library (`libs/shared/package.json` and `libs/shared/dist`) as `node_modules/@droptome/shared`.

## 🔒 Behind Caddy

```
relay.example.org {
	reverse_proxy 127.0.0.1:8080
}
```

Caddy obtains and renews the certificate itself. The front then uses `NEXT_PUBLIC_RELAY_URL=wss://relay.example.org`.
