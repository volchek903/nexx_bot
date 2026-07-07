"use client";

import { motion } from "framer-motion";

type WinModalProps = {
  percent: number;
  onProfile: () => void;
  onStay: () => void;
};

export function WinModal({ percent, onProfile, onStay }: WinModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02030ae0] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-panel w-full max-w-[430px] overflow-hidden p-6 text-center"
      >
        <div className="absolute inset-x-8 top-0 h-px bg-brand-gradient opacity-90" />
        <p className="section-kicker">🔥 Поздравляем!</p>
        <div className="my-4 text-[3.8rem] font-display font-semibold leading-none text-white">{percent}%</div>
        <p className="text-sm leading-6 text-nexx-muted">
          Вы нашли пару и получили скидку {percent}% на бронь игровой комнаты Nexx.
        </p>
        <p className="mt-2 text-sm leading-6 text-nexx-muted">Скидка уже добавлена в ваш профиль.</p>
        <div className="mt-6 grid gap-3">
          <button type="button" className="brand-button" onClick={onProfile}>
            Перейти в профиль
          </button>
          <button type="button" className="secondary-button" onClick={onStay}>
            Остаться здесь
          </button>
        </div>
      </motion.div>
    </div>
  );
}
