type GameStatusProps = {
  loading: boolean;
  status: string;
  error: string | null;
  discountPercent: number | null;
};

export function GameStatus({ loading, status, error, discountPercent }: GameStatusProps) {
  if (error) {
    return (
      <section className="glass-panel border border-rose-400/20 p-4">
        <p className="font-display text-xl text-white">Ошибка</p>
        <p className="mt-2 text-sm leading-6 text-nexx-muted">{error}</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="glass-panel p-4">
        <p className="font-display text-xl text-white">Загружаем игру…</p>
        <p className="mt-2 text-sm leading-6 text-nexx-muted">Подготавливаем игровое поле и проверяем ваш статус.</p>
      </section>
    );
  }

  if (status === "blocked") {
    return (
      <section className="glass-panel p-4">
        <p className="font-display text-xl text-white">Вы уже получили свою скидку 🎁</p>
        <p className="mt-2 text-sm leading-6 text-nexx-muted">
          Она доступна в вашем профиле. Повторная игра недоступна.
          {discountPercent ? ` Текущая скидка: ${discountPercent}%.` : ""}
        </p>
      </section>
    );
  }

  if (status === "completed") {
    return (
      <section className="glass-panel p-4">
        <p className="font-display text-xl text-white">Поздравляем! Ваша скидка закреплена за профилем.</p>
        <p className="mt-2 text-sm leading-6 text-nexx-muted">
          Откройте профиль, чтобы увидеть и использовать ее позже.
        </p>
      </section>
    );
  }

  return (
    <section className="glass-panel p-4">
      <p className="font-display text-xl text-white">Готовы испытать удачу?</p>
      <p className="mt-2 text-sm leading-6 text-nexx-muted">
        {status === "in_progress"
          ? "Откройте две карточки и найдите совпадение."
          : "Откройте карточки Nexx и найдите две одинаковые скидки."}
      </p>
    </section>
  );
}
