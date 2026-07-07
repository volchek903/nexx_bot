import { DiscountCard } from "@/components/profile/DiscountCard";
import type { Discount } from "@/lib/types";

type DiscountListProps = {
  discounts: Discount[];
  loading: boolean;
  error: string | null;
};

export function DiscountList({ discounts, loading, error }: DiscountListProps) {
  return (
    <section className="glass-panel p-5">
      <div className="mb-4">
        <p className="section-kicker">Rewards</p>
        <h2 className="font-display text-2xl font-semibold text-white">Мои скидки</h2>
      </div>

      {loading ? (
        <p className="text-sm text-nexx-muted">Загружаем ваши скидки…</p>
      ) : error ? (
        <p className="text-sm text-nexx-muted">{error}</p>
      ) : discounts.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/4 p-4 text-sm leading-6 text-nexx-muted">
          <p>У вас пока нет скидок 🎁</p>
          <p>Сыграйте в игру, чтобы получить персональную скидку Nexx.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {discounts.map((discount) => (
            <DiscountCard key={discount.id} discount={discount} />
          ))}
        </div>
      )}
    </section>
  );
}
