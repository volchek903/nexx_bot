import type { TelegramUser } from "@/lib/types";

type TelegramWebApp = {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
  };
  ready: () => void;
  expand: () => void;
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
  enableClosingConfirmation?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.Telegram?.WebApp ?? null;
}

export function initializeTelegramWebApp(): TelegramWebApp | null {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    return null;
  }
  webApp.ready();
  webApp.expand();
  webApp.enableClosingConfirmation?.();
  webApp.setHeaderColor?.("#050713");
  webApp.setBackgroundColor?.("#050713");
  webApp.setBottomBarColor?.("#050713");
  return webApp;
}

export function getTelegramUser(): TelegramUser | null {
  return getTelegramWebApp()?.initDataUnsafe.user ?? null;
}

export function openExternalLink(url: string) {
  const webApp = getTelegramWebApp();
  if (webApp?.openLink) {
    webApp.openLink(url, { try_instant_view: false });
    return;
  }

  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
