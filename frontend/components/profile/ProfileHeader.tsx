import type { MeResponse, TelegramUser } from "@/lib/types";

type ProfileHeaderProps = {
  me: MeResponse | null;
  telegramUser: TelegramUser | null;
};

export function ProfileHeader({ me, telegramUser }: ProfileHeaderProps) {
  const firstName = telegramUser?.first_name ?? me?.first_name ?? "Игрок";
  const username = telegramUser?.username ?? me?.username;
  const avatar = telegramUser?.photo_url ?? me?.photo_url;
  const isAdmin = me?.is_admin ?? false;

  return (
    <section className="hero-panel p-5">
      <div className="flex items-center gap-4">
        {avatar ? (
          <img src={avatar} alt={firstName} className="h-16 w-16 rounded-[20px] object-cover ring-1 ring-white/15" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-brand-gradient font-display text-3xl font-semibold text-white shadow-[0_0_26px_rgba(124,58,237,0.26)]">
            {firstName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0">
          <p className="section-kicker">Профиль Nexx</p>
          <h1 className="truncate font-display text-3xl font-semibold text-white">{firstName}</h1>
          <p className="mt-1 truncate text-sm text-nexx-muted">
            {username ? `@${username}` : "Имя пользователя не указано"}
          </p>
          <span className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.18em] text-violet-100">
            Игрок Nexx
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="hero-chip">
          <span className="hero-chip-label">Статус</span>
          <span className="hero-chip-value">онлайн</span>
        </div>
        <div className="hero-chip">
          <span className="hero-chip-label">Доступ</span>
          <span className="hero-chip-value">{isAdmin ? "админ" : "клиент"}</span>
        </div>
        <div className="hero-chip">
          <span className="hero-chip-label">Профиль</span>
          <span className="hero-chip-value">Telegram</span>
        </div>
      </div>
    </section>
  );
}
