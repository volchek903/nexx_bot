import type { AdminStats } from "@/lib/types";

type DiscountStatsChartProps = {
  stats: AdminStats | null;
  loading: boolean;
};

const percentOrder = ["5", "10", "15", "20", "25"];

export function DiscountStatsChart({ stats, loading }: DiscountStatsChartProps) {
  const maxValue = Math.max(...percentOrder.map((percent) => stats?.discounts_by_percent[percent] ?? 0), 1);

  return (
    <section className="glass-panel p-5">
      <div className="mb-4">
        <p className="section-kicker">Распределение</p>
        <h2 className="font-display text-2xl font-semibold text-white">Статистика по скидкам</h2>
      </div>

      {loading || !stats ? (
        <p className="text-sm text-nexx-muted">Подготавливаем статистику по процентам…</p>
      ) : (
        <div className="space-y-4">
          {percentOrder.map((percent) => {
            const value = stats.discounts_by_percent[percent] ?? 0;
            return (
              <div key={percent}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white">{percent}%</span>
                  <span className="text-nexx-muted">{value} чел.</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-brand-gradient shadow-[0_0_18px_rgba(55,232,255,0.22)]"
                    style={{ width: `${Math.max((value / maxValue) * 100, value ? 14 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
