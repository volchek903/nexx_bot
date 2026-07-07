type GameStatusProps = {
  loading: boolean;
  status: string;
  error: string | null;
  discountPercent: number | null;
};

export function GameStatus({ loading, status, error, discountPercent }: GameStatusProps) {
  if (error) {
    return (
      <section className="status-panel border border-rose-400/20 p-4">
        <div className="status-icon">!</div>
        <div>
          <p className="font-display text-xl text-white">Ошибка</p>
          <p className="mt-2 text-sm leading-6 text-nexx-muted">{error}</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="status-panel p-4">
        <div className="status-icon">↻</div>
        <div>
          <p className="font-display text-xl text-white">Загружаем игру…</p>
          <p className="mt-2 text-sm leading-6 text-nexx-muted">
            Подготавливаем игровое поле и проверяем ваш статус.
          </p>
        </div>
      </section>
    );
  }

  if (status === "blocked") {
    return (
      <section className="status-panel p-4">
        <div className="status-icon">✓</div>
        <div>
          <p className="font-display text-xl text-white">Вы уже получили свою скидку 🎁</p>
          <p className="mt-2 text-sm leading-6 text-nexx-muted">
            Она доступна в вашем профиле. Повторная игра недоступна.
            {discountPercent ? ` Текущая скидка: ${discountPercent}%.` : ""}
          </p>
        </div>
      </section>
    );
  }

  if (status === "completed") {
    return (
      <section className="status-panel p-4">
        <div className="status-icon">★</div>
        <div>
          <p className="font-display text-xl text-white">Поздравляем! Ваша скидка закреплена за профилем.</p>
          <p className="mt-2 text-sm leading-6 text-nexx-muted">
            {discountPercent
              ? `За вами уже записана скидка ${discountPercent}%. Откройте профиль, чтобы увидеть и использовать ее позже.`
              : "Откройте профиль, чтобы увидеть и использовать ее позже."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="status-panel p-4">
      <div className="status-icon">{status === "in_progress" ? "⚡" : "▶"}</div>
      <div>
        <p className="font-display text-xl text-white">Готовы испытать удачу?</p>
        <p className="mt-2 text-sm leading-6 text-nexx-muted">
          {status === "in_progress"
            ? "Открывайте карточки и ищите процент, который повторится дважды."
            : "Откройте карточки Nexx и попробуйте выиграть до 50% скидки на аренду игровой комнаты."}
        </p>
      </div>
    </section>
  );
}
