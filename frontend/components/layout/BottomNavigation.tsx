"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { openExternalLink } from "@/lib/telegram";

type BottomNavigationProps = {
  isAdmin: boolean;
};

type NavItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  externalUrl?: string;
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
  {
    label: "Наш сайт",
    externalUrl: "https://nexx.by",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z" />
        <path d="M4 12h16" />
        <path d="M12 4c2.2 2.2 3.5 5 3.5 8s-1.3 5.8-3.5 8c-2.2-2.2-3.5-5-3.5-8s1.3-5.8 3.5-8Z" />
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

function ActiveSpark() {
  const [spark, setSpark] = useState({ x: 24, y: 48, key: 0 });

  useEffect(() => {
    let timeoutId: number | undefined;

    const schedule = () => {
      timeoutId = window.setTimeout(() => {
        setSpark({
          x: 14 + Math.random() * 72,
          y: 18 + Math.random() * 58,
          key: Date.now(),
        });
        schedule();
      }, 1400 + Math.random() * 1800);
    };

    schedule();
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <motion.span
      key={spark.key}
      className="nav-spark"
      style={{ left: `${spark.x}%`, top: `${spark.y}%` }}
      initial={{ opacity: 0, scale: 0.35 }}
      animate={{ opacity: [0, 0.95, 0], scale: [0.3, 1.15, 2.2] }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    />
  );
}

export function BottomNavigation({ isAdmin }: BottomNavigationProps) {
  const pathname = usePathname();
  const navItems = isAdmin ? [...items, adminItem] : items;

  const itemBaseClass =
    "relative isolate flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-1 overflow-hidden rounded-[18px] px-1.5 py-2 text-xs transition sm:rounded-[20px] sm:px-2 sm:py-2.5";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
      <nav className="nav-shell mx-auto flex max-w-[430px] items-center justify-around px-2 py-2 sm:px-3">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-brand-gradient opacity-80" />
        {navItems.map((item) => {
          const isActive = item.href ? pathname === item.href : false;
          const labelClass = `relative z-10 font-display text-[0.66rem] uppercase tracking-[0.1em] min-[390px]:text-[0.72rem] min-[390px]:tracking-[0.14em] ${
            isActive ? "text-white" : ""
          }`;
          const content = (
            <>
              {isActive ? (
                <>
                  <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-brand-gradient opacity-90" />
                  <span className="pointer-events-none absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.22),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.18),transparent_44%)]" />
                  <ActiveSpark />
                </>
              ) : null}

              <span className={`relative z-10 ${isActive ? "text-violet-100" : ""}`}>{item.icon}</span>
              <span className={labelClass}>{item.label}</span>
            </>
          );

          const className = `${itemBaseClass} ${
            isActive
              ? "border border-white/10 bg-[linear-gradient(180deg,rgba(35,29,66,0.96),rgba(12,14,31,0.98))] text-white shadow-[0_0_34px_rgba(124,58,237,0.22)]"
              : "text-nexx-muted"
          }`;

          if (item.externalUrl) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => openExternalLink(item.externalUrl!)}
                className={className}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
