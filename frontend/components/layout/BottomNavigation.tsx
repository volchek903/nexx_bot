"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BottomNavigationProps = {
  isAdmin: boolean;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const items: NavItem[] = [
  {
    href: "/",
    label: "Игра",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 7h10l3 5-2 5h-3l-2-2h-2l-2 2H6l-2-5 3-5Z" />
        <path d="M9 11v2M8 12h2M15.5 11.5h.01M17.5 13.5h.01" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Профиль",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    ),
  },
];

const adminItem: NavItem = {
  href: "/admin",
  label: "Админка",
  icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19h16" />
      <path d="M7 19V9m5 10V5m5 14v-7" />
    </svg>
  ),
};

export function BottomNavigation({ isAdmin }: BottomNavigationProps) {
  const pathname = usePathname();
  const navItems = isAdmin ? [...items, adminItem] : items;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <nav className="mx-auto flex max-w-[430px] items-center justify-around rounded-[26px] border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-brand-gradient opacity-80" />
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs transition ${
                isActive
                  ? "bg-white/8 text-white shadow-[0_0_24px_rgba(55,232,255,0.16)]"
                  : "text-nexx-muted"
              }`}
            >
              <span className={isActive ? "text-cyan-200" : ""}>{item.icon}</span>
              <span
                className={`font-display text-[0.72rem] uppercase tracking-[0.18em] ${
                  isActive ? "bg-brand-gradient bg-clip-text text-transparent" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
