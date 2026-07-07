"use client";

import { motion } from "framer-motion";

type RulesModalProps = {
  onStart: () => void;
};

export function RulesModal({ onStart }: RulesModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#02030acc] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-panel max-w-[430px] p-6"
      >
        <img src="/logo.png" alt="Nexx" className="mx-auto mb-4 w-[86px]" />
        <p className="section-kicker text-center">🎮 Правила игры</p>
        <h2 className="mt-2 text-center font-display text-3xl font-semibold text-white">Найди пару</h2>
        <div className="mt-4 space-y-3 text-sm leading-6 text-nexx-muted">
          <p>На поле спрятаны скидки от 5% до 25%.</p>
          <p>Открывайте карточки и ищите две одинаковые. Когда найдете пару — эта скидка станет вашей.</p>
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
