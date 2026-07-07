import type { PropsWithChildren } from "react";

type AdminOnlyGuardProps = PropsWithChildren<{
  isAdmin: boolean;
  loading: boolean;
}>;

export function AdminOnlyGuard({ isAdmin, loading, children }: AdminOnlyGuardProps) {
  if (loading) {
    return <section className="glass-panel p-5 text-sm text-nexx-muted">Проверяем доступ…</section>;
  }

  if (!isAdmin) {
    return (
      <section className="glass-panel p-5">
        <p className="font-display text-2xl text-white">Доступ запрещен</p>
        <p className="mt-2 text-sm leading-6 text-nexx-muted">
          Эта страница доступна только администраторам Nexx.
        </p>
      </section>
    );
  }

  return <>{children}</>;
}
