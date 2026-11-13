"use client";

import { useState, type FormEventHandler } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRoomStore } from "@/stores/useRoomStore";
import { getRoomCodeProblem } from "@droptome/shared";
import { Icon } from "@/components/Icons/Icon";
import { cn } from "@/library/utils";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import { describeRoomCodeProblem } from "@/utils/room.utils";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setRoomCode = useRoomStore((s) => s.setRoomCode);
  useOverlayClose(isOpen, onClose);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim().toUpperCase();
    const problem = getRoomCodeProblem(trimmed);
    if (problem) {
      setError(describeRoomCodeProblem(problem));
      return;
    }

    setRoomCode(trimmed);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-scrim fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.2 }}
          className="border-cream bg-night w-full max-w-md border p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold italic">Enter a room</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-ash hover:text-moon -mr-4 grid size-11 cursor-pointer place-items-center transition-colors"
            >
              <Icon.close className="size-7 text-current" />
            </button>
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
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().slice(0, 6));
                  setError(null);
                }}
                placeholder="ABC123"
                maxLength={6}
                autoFocus
                autoComplete="off"
                autoCapitalize="characters"
                className={cn(
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
