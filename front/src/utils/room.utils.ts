import { RoomCodeProblem } from "@droptome/shared";

export const describeRoomCodeProblem = (problem: RoomCodeProblem): string => {
  switch (problem) {
    case RoomCodeProblem.EMPTY:
      return "Enter a room code.";
    case RoomCodeProblem.LENGTH:
      return "A room code has 6 characters.";
    case RoomCodeProblem.EXCLUDED_CHARACTER:
      return "Room codes never use the letters I and O or the digits 0 and 1.";
    case RoomCodeProblem.INVALID_CHARACTER:
      return "Use letters and digits only.";
  }
};
