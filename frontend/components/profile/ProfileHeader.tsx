import type { MeResponse, TelegramUser } from "@/lib/types";

type ProfileHeaderProps = {
  me: MeResponse | null;
  telegramUser: TelegramUser | null;
};

export function ProfileHeader({ me, telegramUser }: ProfileHeaderProps) {
  const firstName = telegramUser?.first_name ?? me?.first_name ?? "Игрок";
  const username = telegramUser?.username ?? me?.username;
  const avatar = telegramUser?.photo_url ?? me?.photo_url;

  return (
    <section className="glass-panel p-5">
      <div className="flex items-center gap-4">
        {avatar ? (
          <img src={avatar} alt={firstName} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/15" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient font-display text-3xl font-semibold text-white">
            {firstName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0">
          <p className="section-kicker">Профиль</p>
          <h1 className="truncate font-display text-3xl font-semibold text-white">{firstName}</h1>
          <p className="mt-1 truncate text-sm text-nexx-muted">{username ? `@${username}` : "username не указан"}</p>
          <span className="mt-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
            Игрок Nexx
          </span>
        </div>
      </div>
    </section>
  );
}
