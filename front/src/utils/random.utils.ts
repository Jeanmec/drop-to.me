const RANDOM_ID_BYTES = 16;
const HEX_RADIX = 16;
const HEX_DIGITS_PER_BYTE = 2;

// crypto.randomUUID is missing outside secure contexts, such as plain http
export const createRandomId = (): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(RANDOM_ID_BYTES)), (byte) =>
    byte.toString(HEX_RADIX).padStart(HEX_DIGITS_PER_BYTE, "0"),
  ).join("");
