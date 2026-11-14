import { useEffect } from "react";
import { startSession } from "@/services/session";

export function useNetworkSession(): void {
  useEffect(() => startSession(), []);
}
