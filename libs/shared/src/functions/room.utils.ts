import type { RoomCodeProblem } from '../types/room.t';

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

export function getRoomCodeProblem(code: string): RoomCodeProblem | null {
  if (!code) {
    return 'empty';
  }
  if (code.length !== ROOM_CODE_LENGTH) {
    return 'length';
  }
  const upperCode = code.toUpperCase();
  if (!/^[A-Z0-9]+$/.test(upperCode)) {
    return 'invalid-character';
  }
  if (![...upperCode].every((char) => ROOM_CODE_CHARS.includes(char))) {
    return 'excluded-character';
  }
  return null;
}

export function validateRoomCode(code: string): boolean {
  return getRoomCodeProblem(code) === null;
}

export function normalizeRoomCode(code: string): string {
  return code.toUpperCase().replace(/\s/g, '');
}
