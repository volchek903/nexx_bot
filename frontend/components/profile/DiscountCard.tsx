import type { Discount } from "@/lib/types";

const statusMap: Record<string, string> = {
  active: "активна",
  used: "использована",
  expired: "истекла",
};

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function DiscountCard({ discount }: { discount: Discount }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_0_30px_rgba(139,53,255,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-3xl font-semibold text-white">Скидка {discount.percent}%</p>
          <p className="mt-2 text-sm text-nexx-muted">Статус: {statusMap[discount.status] ?? discount.status}</p>
          <p className="mt-1 text-sm text-nexx-muted">Можно использовать 1 раз</p>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-100">
          Nexx
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-nexx-muted">
        <div>
          <p className="text-white">Получена</p>
          <p>{formatDate(discount.created_at)}</p>
        </div>
        <div>
          <p className="text-white">Истекает</p>
          <p>{formatDate(discount.expires_at)}</p>
        </div>
      </div>
    </article>
  );
}
