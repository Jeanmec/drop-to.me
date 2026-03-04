"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRoomStore } from "@/stores/useRoomStore";
import { validateRoomCode } from "@droptome/shared";
import { Icon } from "@/components/Icons/Icon";
import { cn } from "@/library/utils";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setRoomCode = useRoomStore((s) => s.setRoomCode);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter a room code");
      return;
    }
    if (!validateRoomCode(trimmed)) {
      setError("Code must be 6 characters (uppercase letters and numbers)");
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.2 }}
          className="w-full max-w-md rounded-xl border-2 border-slate-700 bg-slate-900 p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Enter a room
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <Icon.close className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="join-code"
                className="mb-2 block text-sm text-slate-400"
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
                className={cn(
                  "w-full rounded-lg border-2 bg-slate-800 px-4 py-2 font-mono text-lg tracking-widest text-white placeholder:text-slate-500",
                  error ? "border-red-500" : "border-slate-600",
                )}
              />
              {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border-2 border-slate-600 py-2 text-slate-400 transition-colors hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg border-2 border-primary-blue bg-primary-blue/20 py-2 font-semibold text-white transition-colors hover:bg-primary-blue/40"
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
