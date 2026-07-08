import { DiscountCard } from "@/components/profile/DiscountCard";
import type { Discount } from "@/lib/types";

type DiscountListProps = {
  discounts: Discount[];
  loading: boolean;
  error: string | null;
};

export function DiscountList({ discounts, loading, error }: DiscountListProps) {
  const currentDiscount = discounts[0] ?? null;

  return (
    <section className="glass-panel p-5">
      <div className="mb-4">
        <p className="section-kicker">Ваша скидка</p>
        <h2 className="font-display text-2xl font-semibold text-white">Моя скидка</h2>
      </div>

      {loading ? (
        <p className="text-sm text-nexx-muted">Загружаем ваши скидки…</p>
      ) : error ? (
        <p className="text-sm text-nexx-muted">{error}</p>
      ) : !currentDiscount ? (
        <div className="empty-well p-4 text-sm leading-6 text-nexx-muted">
          <p>У вас пока нет скидок 🎁</p>
          <p>Сыграйте в игру, чтобы получить персональную скидку Nexx.</p>
        </div>
      ) : (
        <DiscountCard discount={currentDiscount} />
      )}
    </section>
  );
}
