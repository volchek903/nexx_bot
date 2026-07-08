type LogoHeaderProps = {
  title: string;
  subtitle: string;
};

export function LogoHeader({ title, subtitle }: LogoHeaderProps) {
  return (
    <header className="hero-panel relative overflow-hidden px-4 pb-5 pt-4 text-center sm:px-5 sm:pb-6 sm:pt-5">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-brand-gradient opacity-90" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.18),transparent_34%)]" />
      <div className="pointer-events-none absolute -right-10 top-10 h-32 w-32 rotate-12 rounded-full border border-fuchsia-300/10" />
      <div className="pointer-events-none absolute -left-8 bottom-10 h-24 w-24 rounded-full border border-cyan-300/10" />
      <div className="pointer-events-none absolute bottom-3 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="brand-domain mx-auto mb-4">nexx.by</div>
      <p className="section-kicker px-2">Игровая комната • акция Nexx</p>
      <h1 className="font-display text-[2.18rem] font-semibold leading-[0.92] tracking-[-0.02em] text-white min-[390px]:text-[2.55rem] sm:text-[2.7rem]">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-[18rem] text-[0.95rem] leading-6 text-nexx-muted min-[390px]:max-w-[19rem] min-[390px]:text-[0.98rem] sm:leading-7">
        {subtitle}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2 text-left sm:mt-6">
        <div className="hero-chip">
          <span className="hero-chip-label">Формат</span>
          <span className="hero-chip-value">3x3</span>
        </div>
        <div className="hero-chip">
          <span className="hero-chip-label">Победа</span>
          <span className="hero-chip-value">до 50%</span>
        </div>
        <div className="hero-chip">
          <span className="hero-chip-label">Доступ</span>
          <span className="hero-chip-value">1 игра</span>
        </div>
      </div>
    </header>
  );
}
