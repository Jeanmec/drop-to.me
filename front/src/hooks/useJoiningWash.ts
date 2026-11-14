import { useState } from "react";

interface JoiningWash {
  isWashed: boolean;
  isHeld: boolean;
  release: () => void;
}

export function useJoiningWash(isJoining: boolean): JoiningWash {
  const [wasJoining, setWasJoining] = useState(isJoining);
  const [isHeld, setIsHeld] = useState(isJoining);

  if (isJoining !== wasJoining) {
    setWasJoining(isJoining);
    if (isJoining) {
      setIsHeld(true);
    }
  }

  return {
    isWashed: isJoining || isHeld,
    isHeld,
    release: () => setIsHeld(false),
  };
}
