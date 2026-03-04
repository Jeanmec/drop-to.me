const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const idx = Math.floor(Math.random() * ROOM_CODE_CHARS.length);
    code += ROOM_CODE_CHARS[idx];
  }
  return code;
}

export function validateRoomCode(code: string): boolean {
  if (code.length !== ROOM_CODE_LENGTH) return false;
  const upperCode = code.toUpperCase();
  return [...upperCode].every((char) => ROOM_CODE_CHARS.includes(char));
}

export function normalizeRoomCode(code: string): string {
  return code.toUpperCase().replace(/\s/g, '');
}
