import type { RoomCodeProblem } from "@droptome/shared";

export const describeRoomCodeProblem = (problem: RoomCodeProblem): string => {
  switch (problem) {
    case "empty":
      return "Enter a room code.";
    case "length":
      return "A room code has 6 characters.";
    case "excluded-character":
      return "Room codes never use the letters I and O or the digits 0 and 1.";
    case "invalid-character":
      return "Use letters and digits only.";
  }
};
