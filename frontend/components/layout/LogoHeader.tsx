type LogoHeaderProps = {
  title: string;
  subtitle: string;
};

export function LogoHeader({ title, subtitle }: LogoHeaderProps) {
  return (
    <header className="glass-panel relative overflow-hidden p-5 text-center">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-brand-gradient opacity-80" />
      <img
        src="/logo.png"
        alt="Nexx"
        className="mx-auto mb-4 w-[132px] drop-shadow-[0_0_18px_rgba(0,183,255,0.35)] drop-shadow-[0_0_24px_rgba(255,61,206,0.25)]"
      />
      <p className="section-kicker">Gaming Lounge Mini App</p>
      <h1 className="font-display text-[2rem] font-semibold leading-none text-white">{title}</h1>
      <p className="mx-auto mt-3 max-w-[18rem] text-sm leading-6 text-nexx-muted">{subtitle}</p>
    </header>
  );
}
