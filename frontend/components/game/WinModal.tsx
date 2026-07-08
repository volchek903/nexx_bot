"use client";

import { motion } from "framer-motion";

type WinModalProps = {
  percent: number;
  onProfile: () => void;
  onStay: () => void;
};

export function WinModal({ percent, onProfile, onStay }: WinModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#02030ae0] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-8 sm:items-center sm:px-4 sm:pb-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-panel max-h-[min(86dvh,720px)] w-full max-w-[430px] overflow-y-auto p-5 text-center sm:p-6"
      >
        <div className="absolute inset-x-8 top-0 h-px bg-brand-gradient opacity-90" />
        <p className="section-kicker">🔥 Поздравляем!</p>
        <div className="my-4 text-[3rem] font-display font-semibold leading-none text-white min-[390px]:text-[3.8rem]">
          {percent}%
        </div>
        <p className="text-sm leading-6 text-nexx-muted">
          Вы открыли два одинаковых процента и выиграли скидку {percent}% на аренду игровой комнаты Nexx.
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
