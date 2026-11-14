"use client";

import { getRoomCodeProblem, normalizeRoomCode } from "@droptome/shared";
import clsx from "clsx";
import { useState, type FormEvent, type MouseEvent } from "react";
import CloseButton from "@/components/ui/CloseButton";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import { useRoomStore } from "@/stores/useRoomStore";
import { describeRoomCodeProblem } from "@/utils/room.utils";

const ROOM_CODE_LENGTH = 6;

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const openAsModal = (dialog: HTMLDialogElement | null): void => {
  if (dialog && !dialog.open) {
    dialog.showModal();
    // showModal hands the focus to the first control of the dialog, the close button
    dialog.querySelector("input")?.focus();
  }
};

export default function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setRoomCode = useRoomStore((state) => state.setRoomCode);
  useOverlayClose(isOpen, onClose);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const roomCode = normalizeRoomCode(code);
    const problem = getRoomCodeProblem(roomCode);
    if (problem !== null) {
      setError(describeRoomCodeProblem(problem));
      return;
    }

    setRoomCode(roomCode);
    onClose();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      ref={openAsModal}
      aria-labelledby="join-room-title"
      onClose={onClose}
      onClick={handleBackdropClick}
      className="border-cream bg-night text-cream backdrop:bg-scrim inset-x-4 m-auto w-auto max-w-md border p-0 transition duration-200 backdrop:backdrop-blur-sm starting:scale-95 starting:opacity-0"
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 id="join-room-title" className="text-xl font-semibold italic">
            Enter a room
          </h3>
          <CloseButton
            label="Close"
            onClick={onClose}
            className="-mr-4 transition-colors"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="join-code"
              className="text-ash mb-2 block font-mono text-xs"
            >
              Room code (6 characters)
            </label>
            <input
              id="join-code"
              type="text"
              value={code}
              onChange={(event) => {
                setCode(
                  event.target.value.toUpperCase().slice(0, ROOM_CODE_LENGTH),
                );
                setError(null);
              }}
              placeholder="ABC123"
              maxLength={ROOM_CODE_LENGTH}
              autoComplete="off"
              autoCapitalize="characters"
              className={clsx(
                "placeholder:text-ash/75 w-full border bg-transparent px-4 py-2 font-mono text-lg tracking-widest focus-visible:outline-offset-0",
                error ? "border-alert" : "border-ash",
              )}
            />
            {error && (
              <p className="text-alert mt-2 font-mono text-xs">{error}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border-ash text-ash text-label hover:border-cream hover:text-cream min-h-11 flex-1 cursor-pointer rounded-full border font-mono tracking-wider uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-moon text-night text-label min-h-11 flex-1 cursor-pointer rounded-full font-mono font-medium tracking-wider uppercase"
            >
              Enter
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
