import type { Discount } from "@/lib/types";

const statusMap: Record<string, string> = {
  active: "активна",
  used: "использована",
  expired: "истекла",
};

const statusToneMap: Record<string, string> = {
  active: "border-cyan-300/20 bg-cyan-300/10 text-cyan-50",
  used: "border-violet-300/20 bg-violet-300/10 text-violet-50",
  expired: "border-white/10 bg-white/5 text-white/70",
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
  const statusLabel = statusMap[discount.status] ?? discount.status;
  const statusTone = statusToneMap[discount.status] ?? "border-white/10 bg-white/5 text-white/75";

  return (
    <article className="discount-spotlight">
      <div className="discount-spotlight-grid">
        <div className="discount-badge-wrap">
          <div className="discount-badge-orbit" />
          <div className="discount-badge">
            <span className="discount-badge-label">ваш процент</span>
            <span className="discount-badge-value">{discount.percent}%</span>
            <span className="discount-badge-caption">на аренду Nexx</span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="section-kicker">Скидка активирована</p>
              <h3 className="mt-2 font-display text-[1.9rem] leading-[0.96] text-white sm:text-[2.35rem]">
                Аренда Nexx
              </h3>
              <p className="mt-3 max-w-[28rem] text-sm leading-6 text-nexx-muted sm:text-[0.95rem]">
                Персональная скидка закреплена за вашим профилем. Её можно использовать один раз при бронировании.
              </p>
            </div>

            <div className={`rounded-full border px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.18em] ${statusTone}`}>
              {statusLabel}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="discount-fact">
              <span className="discount-fact-label">Статус</span>
              <span className="discount-fact-value">{statusLabel}</span>
            </div>
            <div className="discount-fact">
              <span className="discount-fact-label">Использование</span>
              <span className="discount-fact-value">1 раз</span>
            </div>
            <div className="discount-fact">
              <span className="discount-fact-label">Получена</span>
              <span className="discount-fact-value">{formatDate(discount.created_at)}</span>
            </div>
            <div className="discount-fact">
              <span className="discount-fact-label">Истекает</span>
              <span className="discount-fact-value">{formatDate(discount.expires_at)}</span>
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-4 py-3 text-sm leading-6 text-nexx-muted">
            Скидка отображается только у вас и будет применяться к бронированию игровой комнаты Nexx.
          </div>
        </div>
      </div>
    </article>
  );
}
