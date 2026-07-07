import type { AdminStats } from "@/lib/types";

type AdminStatsCardsProps = {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
};

const statCards = [
  { key: "users_total", label: "Всего пользователей" },
  { key: "miniapp_opened", label: "Открыли Mini App" },
  { key: "games_started", label: "Начали игру" },
  { key: "games_completed", label: "Выиграли скидку" },
  { key: "active_discounts", label: "Активные скидки" },
  { key: "used_discounts", label: "Использованные скидки" },
] as const;

export function AdminStatsCards({ stats, loading, error }: AdminStatsCardsProps) {
  if (loading) {
    return (
      <section className="glass-panel p-5 text-sm text-nexx-muted">Загружаем статистику…</section>
    );
  }

  if (error || !stats) {
    return (
      <section className="glass-panel p-5 text-sm text-nexx-muted">{error ?? "Статистика недоступна."}</section>
    );
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {statCards.map((card) => (
        <article key={card.key} className="glass-panel p-4">
          <p className="section-kicker">{card.label}</p>
          <p className="mt-3 font-display text-4xl font-semibold text-white">
            {stats[card.key].toLocaleString("ru-RU")}
          </p>
        </article>
      ))}
    </section>
  );
}
