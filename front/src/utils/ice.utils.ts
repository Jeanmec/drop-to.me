// "stun:stun.example.org:3478" -> "stun.example.org"
export const iceServerHost = (url: string): string =>
  new URL(url).pathname.split(":")[0];
