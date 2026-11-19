"use client";

import clsx from "clsx";
import { useState } from "react";
import { isPeerPresent, usePeersStore } from "@/stores/usePeersStore";
import type { TPeer } from "@/types/peer.t";
import { Berth, BoatSignal, type TMooring } from "@/types/scene.t";
import { moorPeers } from "@/utils/fleet.utils";
import Boat from "./Boat";
import { berthClass } from "./berthClass";
import styles from "./Fleet.module.css";

interface BoatFleetProps {
  isBeamHeld: boolean;
}

const BERTHS: Berth[] = [Berth.WEST, Berth.EAST, Berth.COVE];
const EMPTY_MOORINGS: (TMooring | null)[] = BERTHS.map(() => null);

const signalOf = (peer: TPeer | undefined): BoatSignal => {
  if (peer?.isSending) {
    return BoatSignal.RECEIVING;
  }
  return peer?.sendProgress === 100 ? BoatSignal.RECEIVED : BoatSignal.IDLE;
};

export default function BoatFleet({ isBeamHeld }: BoatFleetProps) {
  const targetPeers = usePeersStore((state) => state.targetPeers);
  const updatePeer = usePeersStore((state) => state.updatePeer);
  const [moorings, setMoorings] = useState(EMPTY_MOORINGS);

  const nextMoorings = moorPeers(moorings, targetPeers);
  if (nextMoorings !== moorings) {
    setMoorings(nextMoorings);
  }

  const boats = BERTHS.map((berth, index) => {
    const mooring = nextMoorings[index];
    const peer = targetPeers.find(
      (target) => target.peerId === mooring?.peerId,
    );
    return { berth, mooring, peer };
  });

  return (
    <>
      {isBeamHeld &&
        boats.map(
          ({ berth, peer }) =>
            peer?.isSending && (
              <span
                key={berth}
                className={clsx(styles.ray, berthClass(berth))}
                aria-hidden
              />
            ),
        )}
      <ul className={styles.fleet} aria-label="Connected devices">
        {boats.map(({ berth, mooring, peer }) => (
          <Boat
            key={berth}
            berth={berth}
            device={mooring?.device}
            isMoored={peer !== undefined}
            isReachable={peer !== undefined && isPeerPresent(peer)}
            signal={signalOf(peer)}
            progress={peer?.sendProgress ?? 0}
            onReceivedShown={() => {
              if (mooring) {
                updatePeer(mooring.peerId, { sendProgress: undefined });
              }
            }}
          />
        ))}
      </ul>
    </>
  );
}
