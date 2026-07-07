"use client";

import { motion } from "framer-motion";

import type { GameCardState } from "@/lib/types";

type GameCardProps = {
  card: GameCardState;
  disabled: boolean;
  busy: boolean;
  onClick: () => void;
};

function percentGlowClass(percent: number | null) {
  switch (percent) {
    case 5:
      return "discount-glow-5";
    case 10:
      return "discount-glow-10";
    case 15:
      return "discount-glow-15";
    case 20:
      return "discount-glow-20";
    case 25:
      return "discount-glow-25";
    default:
      return "";
  }
}

export function GameCard({ card, disabled, busy, onClick }: GameCardProps) {
  const faceUp = card.is_opened || card.is_matched;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || faceUp}
      className={`group aspect-[0.84] w-full rounded-[22px] text-left [perspective:1000px] ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <motion.div
        animate={{ rotateY: faceUp ? 180 : 0, scale: busy ? 0.98 : 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        <div className="card-face card-back">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,transparent_0%,rgba(255,255,255,0.05)_100%)]" />
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(135deg,transparent_0%,transparent_35%,rgba(255,255,255,0.08)_35%,rgba(255,255,255,0.08)_37%,transparent_37%,transparent_100%)]" />
          <div className="relative z-10 flex h-full items-center justify-center">
            <span className="nexx-wordmark">Nexx</span>
          </div>
        </div>

        <div className={`card-face card-front ${percentGlowClass(card.revealed_percent)}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_45%)]" />
          <div className="relative z-10 flex h-full items-center justify-center">
            <span className="font-display text-[2rem] font-semibold text-white">
              {card.revealed_percent ?? "?"}%
            </span>
          </div>
        </div>
      </motion.div>
    </button>
  );
}
