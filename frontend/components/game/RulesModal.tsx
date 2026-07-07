"use client";

import { motion } from "framer-motion";

type RulesModalProps = {
  onStart: () => void;
};

export function RulesModal({ onStart }: RulesModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#02030acc] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-8 sm:items-center sm:px-4 sm:pb-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-panel max-h-[min(86dvh,720px)] w-full max-w-[430px] overflow-y-auto p-5 sm:p-6"
      >
        <div className="brand-domain brand-domain-compact mx-auto mb-4">nexx.by</div>
        <p className="section-kicker text-center">🎮 Правила игры</p>
        <h2 className="mt-2 text-center font-display text-[2rem] font-semibold text-white sm:text-3xl">
          Найди пару
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-6 text-nexx-muted">
          <p>
            Чтобы попытать свою удачу, вам необходимо всего лишь угадать, где находятся 2 одинаковые
            карточки, на которых будет написан процент скидки.
          </p>
          <p>Процент может выпасть как от 5%, так и до 50% на аренду игровой комнаты.</p>
          <p>Играть можно только один раз, а скидка будет закреплена за вашим Telegram-профилем.</p>
          <p>Удачи! 🔥</p>
        </div>
        <button type="button" className="brand-button mt-6 w-full" onClick={onStart}>
          Начать игру
        </button>
      </motion.div>
    </div>
  );
}
