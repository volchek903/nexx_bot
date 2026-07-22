"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type PointerEventHandler } from "react";

import type { GameCardState } from "@/lib/types";

type GameCardProps = {
  card: GameCardState;
  celebrationActive: boolean;
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

export function GameCard({ card, celebrationActive, disabled, busy, onClick }: GameCardProps) {
  const faceUp = card.is_opened || card.is_matched;
  const matchedCelebration = celebrationActive && card.is_matched;
  const blurredByCelebration = celebrationActive && !card.is_matched;
  const [allowsPointerMotion, setAllowsPointerMotion] = useState(false);
  const [motionState, setMotionState] = useState({ rotateX: 0, rotateY: 0, shiftX: 0, shiftY: 0 });
  const [spark, setSpark] = useState({ x: 34, y: 36, key: 0 });

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const sync = () => {
      setAllowsPointerMotion(media.matches);
    };

    sync();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", sync);
      return () => {
        media.removeEventListener("change", sync);
      };
    }

    media.addListener(sync);
    return () => {
      media.removeListener(sync);
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      return;
    }

    let timeoutId: number | undefined;

    const schedule = () => {
      timeoutId = window.setTimeout(() => {
        setSpark({
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
          key: Date.now(),
        });
        schedule();
      }, 850 + Math.random() * 2000);
    };

    schedule();
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [disabled]);

  const handlePointerMove: PointerEventHandler<HTMLButtonElement> = (event) => {
    if (!allowsPointerMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const offsetX = (x - 50) / 50;
    const offsetY = (y - 50) / 50;

    setMotionState({
      rotateX: Number((-offsetY * 13).toFixed(2)),
      rotateY: Number((offsetX * 14.5).toFixed(2)),
      shiftX: Number((offsetX * 8.5).toFixed(2)),
      shiftY: Number((offsetY * 7).toFixed(2)),
    });
  };

  const handlePointerLeave = () => {
    setMotionState({ rotateX: 0, rotateY: 0, shiftX: 0, shiftY: 0 });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerMove={allowsPointerMotion ? handlePointerMove : undefined}
      onPointerLeave={allowsPointerMotion ? handlePointerLeave : undefined}
      disabled={disabled || faceUp}
      className={`group relative aspect-[0.84] w-full overflow-hidden rounded-[22px] text-left transition-[filter,opacity,transform] duration-500 [perspective:1000px] ${
        blurredByCelebration ? "scale-[0.95] blur-[1.8px] opacity-30 saturate-[0.55]" : ""
      } ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <motion.div
        animate={{
          rotateX: allowsPointerMotion ? motionState.rotateX : 0,
          rotateY: allowsPointerMotion ? motionState.rotateY : 0,
          x: allowsPointerMotion ? motionState.shiftX : 0,
          y:
            matchedCelebration
              ? -7
              : !allowsPointerMotion || disabled || (!motionState.shiftX && !motionState.shiftY)
                ? 0
                : motionState.shiftY - 4,
          scale: matchedCelebration ? 1.07 : busy ? 0.98 : allowsPointerMotion && (motionState.rotateX || motionState.rotateY) ? 1.03 : 1,
          filter:
            matchedCelebration
              ? "brightness(1.14) saturate(1.18)"
              : busy
              ? "brightness(0.96)"
              : allowsPointerMotion && (motionState.rotateX || motionState.rotateY)
                ? "brightness(1.06)"
                : "brightness(1)",
          boxShadow: matchedCelebration
            ? "0 0 42px rgba(0,232,255,0.24), 0 0 56px rgba(244,63,94,0.16)"
            : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ duration: matchedCelebration ? 0.5 : 0.22, ease: "easeOut" }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        <motion.div
          animate={{ rotateY: faceUp ? 180 : 0 }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full w-full [transform-style:preserve-3d]"
        >
          <div className={`card-face card-back ${faceUp ? "card-face-hidden" : "card-face-visible"}`}>
            <div className="absolute inset-0 bg-[linear-gradient(145deg,transparent_0%,rgba(55,232,255,0.06)_100%)]" />
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(135deg,transparent_0%,transparent_35%,rgba(55,232,255,0.08)_35%,rgba(55,232,255,0.08)_37%,transparent_37%,transparent_100%)]" />
            <motion.div
              animate={{
                x: motionState.shiftX * 0.8,
                y: motionState.shiftY * 0.8,
              }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 rounded-[22px] bg-[linear-gradient(120deg,rgba(255,255,255,0.18)_0%,rgba(55,232,255,0.08)_14%,transparent_38%),linear-gradient(300deg,rgba(34,120,255,0.14),transparent_36%),linear-gradient(25deg,transparent_55%,rgba(255,61,206,0.12)_100%)] opacity-90"
            />
            {!disabled ? (
              <motion.span
                key={spark.key}
                className="card-spark"
                style={{ left: `${spark.x}%`, top: `${spark.y}%` }}
                initial={{ opacity: 0, scale: 0.35 }}
                animate={{ opacity: [0, 0.95, 0], scale: [0.4, 1.25, 2.2] }}
                transition={{ duration: 0.95, ease: "easeOut" }}
              />
            ) : null}
            <motion.div
              animate={{
                x: motionState.shiftX * -0.65,
                y: motionState.shiftY * -0.65,
              }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative z-10 flex h-full items-center justify-center"
            >
              <span className="nexx-wordmark">Nexx</span>
            </motion.div>
          </div>

          <div
            className={`card-face card-front ${faceUp ? "card-face-visible" : "card-face-hidden"} ${percentGlowClass(card.revealed_percent)}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(55,232,255,0.16),transparent_45%)]" />
            {matchedCelebration ? (
              <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_center,rgba(0,232,255,0.18),transparent_60%)]" />
            ) : null}
            <motion.div
              animate={{
                x: motionState.shiftX * 0.7,
                y: motionState.shiftY * 0.7,
              }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 rounded-[22px] bg-[linear-gradient(125deg,rgba(255,255,255,0.18)_0%,rgba(55,232,255,0.08)_18%,transparent_46%),linear-gradient(320deg,rgba(244,63,94,0.08),transparent_30%)]"
            />
            <motion.div
              animate={{
                x: motionState.shiftX * -0.55,
                y: motionState.shiftY * -0.55,
              }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative z-10 flex h-full items-center justify-center"
            >
              <motion.div
                initial={false}
                animate={
                  faceUp
                    ? { scale: matchedCelebration ? [0.92, 1.08, 1.02] : [0.92, 1.02, 1], opacity: 1 }
                    : { scale: 0.88, opacity: 0 }
                }
                transition={{ duration: matchedCelebration ? 0.6 : 0.42, ease: [0.22, 1, 0.36, 1] }}
                className={`relative overflow-hidden rounded-[18px] border px-3 py-4 text-center ${
                  matchedCelebration
                    ? "border-cyan-200/30 bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0.05)),radial-gradient(circle_at_top,rgba(0,232,255,0.18),transparent_58%)] shadow-[0_0_38px_rgba(0,232,255,0.18)]"
                    : "border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))]"
                }`}
              >
                <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70" />
                <p className="text-[0.58rem] uppercase tracking-[0.18em] text-cyan-100/80">
                  {matchedCelebration ? "ваш приз" : "скидка"}
                </p>
                <span className="mt-1 block font-display text-[1.95rem] font-semibold leading-none text-white min-[390px]:text-[2.15rem]">
                  {card.revealed_percent ?? "?"}%
                </span>
                <p className="mt-1 text-[0.58rem] uppercase tracking-[0.18em] text-white/60">аренда Nexx</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </button>
  );
}
