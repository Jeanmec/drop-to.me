import { RoomCodeProblem } from '../types/room.t';

const ROOM_CODE_LENGTH = 6;
// without I, O, 0 and 1, which read alike
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_PATTERN = new RegExp(
  `^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`,
);
const ALPHANUMERIC_PATTERN = /^[A-Z0-9]+$/;

export function normalizeRoomCode(code: string): string {
  return code.toUpperCase().replace(/\s/g, '');
}

export function getRoomCodeProblem(code: string): RoomCodeProblem | null {
  const roomCode = code.toUpperCase();

  if (ROOM_CODE_PATTERN.test(roomCode)) {
    return null;
  }
  if (roomCode.length === 0) {
    return RoomCodeProblem.EMPTY;
  }
  if (roomCode.length !== ROOM_CODE_LENGTH) {
    return RoomCodeProblem.LENGTH;
  }
  return ALPHANUMERIC_PATTERN.test(roomCode)
    ? RoomCodeProblem.EXCLUDED_CHARACTER
    : RoomCodeProblem.INVALID_CHARACTER;
}

export function validateRoomCode(code: string): boolean {
  return getRoomCodeProblem(code) === null;
}
