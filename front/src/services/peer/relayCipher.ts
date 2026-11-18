export interface RelayCipher {
  encrypt: (data: string | Uint8Array<ArrayBuffer>) => Promise<ArrayBuffer>;
  decrypt: (frame: ArrayBuffer) => Promise<string | ArrayBuffer>;
}

// the values are the HKDF info of the key that protects each direction
enum KeyDirection {
  TO_RESPONDER = "to-responder",
  TO_INITIATOR = "to-initiator",
}

// first byte of a frame once decrypted
enum FrameKind {
  TEXT = 0,
  BINARY = 1,
}

const KEY_EXCHANGE: EcKeyGenParams = { name: "ECDH", namedCurve: "P-256" };
const SHARED_SECRET_BITS = 256;
const FRAME_KEY: AesKeyGenParams = { name: "AES-GCM", length: 256 };
const NONCE_BYTES = 12;
const KIND_BYTES = 1;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const createRelayKeyPair = (): Promise<CryptoKeyPair> =>
  crypto.subtle.generateKey(KEY_EXCHANGE, false, ["deriveBits"]);

export const exportRelayPublicKey = async (
  keyPair: Promise<CryptoKeyPair>,
): Promise<number[]> => {
  const { publicKey } = await keyPair;
  return Array.from(
    new Uint8Array(await crypto.subtle.exportKey("raw", publicKey)),
  );
};

// the nonce is the rank of the frame in its direction: a frame lost, repeated or moved fails to decrypt
const nonceOf = (frameRank: number): Uint8Array<ArrayBuffer> => {
  const nonce = new Uint8Array(NONCE_BYTES);
  new DataView(nonce.buffer).setBigUint64(0, BigInt(frameRank));
  return nonce;
};

const packFrame = (
  data: string | Uint8Array<ArrayBuffer>,
): Uint8Array<ArrayBuffer> => {
  const isText = typeof data === "string";
  const payload = isText ? encoder.encode(data) : data;
  const frame = new Uint8Array(KIND_BYTES + payload.byteLength);

  frame[0] = isText ? FrameKind.TEXT : FrameKind.BINARY;
  frame.set(payload, KIND_BYTES);
  return frame;
};

const unpackFrame = (frame: ArrayBuffer): string | ArrayBuffer => {
  const [kind] = new Uint8Array(frame, 0, KIND_BYTES);
  return kind === FrameKind.TEXT
    ? decoder.decode(new Uint8Array(frame, KIND_BYTES))
    : frame.slice(KIND_BYTES);
};

export const deriveRelayCipher = async (
  keyPair: Promise<CryptoKeyPair>,
  peerPublicKey: number[],
  linkId: string,
  isInitiator: boolean,
): Promise<RelayCipher> => {
  const [{ privateKey }, peerKey] = await Promise.all([
    keyPair,
    crypto.subtle.importKey(
      "raw",
      new Uint8Array(peerPublicKey),
      KEY_EXCHANGE,
      false,
      [],
    ),
  ]);
  const sharedSecret = await crypto.subtle.importKey(
    "raw",
    await crypto.subtle.deriveBits(
      { name: KEY_EXCHANGE.name, public: peerKey },
      privateKey,
      SHARED_SECRET_BITS,
    ),
    "HKDF",
    false,
    ["deriveKey"],
  );
  const deriveFrameKey = (
    direction: KeyDirection,
    usage: KeyUsage,
  ): Promise<CryptoKey> =>
    crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: encoder.encode(linkId),
        info: encoder.encode(direction),
      },
      sharedSecret,
      FRAME_KEY,
      false,
      [usage],
    );
  const [sendKey, receiveKey] = await Promise.all([
    deriveFrameKey(
      isInitiator ? KeyDirection.TO_RESPONDER : KeyDirection.TO_INITIATOR,
      "encrypt",
    ),
    deriveFrameKey(
      isInitiator ? KeyDirection.TO_INITIATOR : KeyDirection.TO_RESPONDER,
      "decrypt",
    ),
  ]);
  let sentFrames = 0;
  let receivedFrames = 0;

  return {
    encrypt: (data) => {
      const nonce = nonceOf(sentFrames);
      sentFrames += 1;
      return crypto.subtle.encrypt(
        { name: FRAME_KEY.name, iv: nonce },
        sendKey,
        packFrame(data),
      );
    },
    decrypt: async (frame) => {
      const nonce = nonceOf(receivedFrames);
      receivedFrames += 1;
      return unpackFrame(
        await crypto.subtle.decrypt(
          { name: FRAME_KEY.name, iv: nonce },
          receiveKey,
          frame,
        ),
      );
    },
  };
};
