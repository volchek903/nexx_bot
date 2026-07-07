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
    <article className="discount-ticket">
      <div className="discount-ticket-mark">
        <span className="discount-ticket-value">{discount.percent}%</span>
      </div>
      <div className="flex-1">
        <div className="flex flex-col items-start gap-3 min-[380px]:flex-row min-[380px]:justify-between">
          <div>
            <p className="font-display text-xl font-semibold text-white min-[390px]:text-2xl">Аренда Nexx</p>
            <p className="mt-2 text-sm text-nexx-muted">Статус: {statusMap[discount.status] ?? discount.status}</p>
            <p className="mt-1 text-sm text-nexx-muted">Можно использовать 1 раз</p>
          </div>
          <div className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-violet-100">
            активна
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-nexx-muted min-[390px]:grid-cols-2">
          <div>
            <p className="text-white">Получена</p>
            <p>{formatDate(discount.created_at)}</p>
          </div>
          <div>
            <p className="text-white">Истекает</p>
            <p>{formatDate(discount.expires_at)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
