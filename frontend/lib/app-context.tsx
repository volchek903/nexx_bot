"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { fetchMe } from "@/lib/api";
import { getTelegramUser, initializeTelegramWebApp } from "@/lib/telegram";
import type { MeResponse, TelegramUser } from "@/lib/types";

type MiniAppContextValue = {
  initData: string;
  telegramUser: TelegramUser | null;
  me: MeResponse | null;
  loading: boolean;
  error: string | null;
  refreshMe: () => Promise<void>;
};

const MiniAppContext = createContext<MiniAppContextValue | null>(null);

export function AppProviders({ children }: PropsWithChildren) {
  const [initData, setInitData] = useState("");
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMe = async () => {
    if (!initData) {
      setLoading(false);
      setError("Откройте Mini App внутри Telegram, чтобы продолжить.");
      return;
    }

    try {
      const response = await fetchMe(initData);
      startTransition(() => {
        setMe(response);
        setError(null);
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось загрузить профиль.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const webApp = initializeTelegramWebApp();
    if (!webApp?.initData) {
      setTelegramUser(getTelegramUser());
      setLoading(false);
      setError("Откройте Mini App внутри Telegram, чтобы продолжить.");
      return;
    }

    setInitData(webApp.initData);
    setTelegramUser(getTelegramUser());
  }, []);

  useEffect(() => {
    if (!initData) {
      return;
    }
    void refreshMe();
    // refreshMe intentionally depends on current initData only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initData]);

  const value = useMemo(
    () => ({
      initData,
      telegramUser,
      me,
      loading,
      error,
      refreshMe,
    }),
    [error, initData, loading, me, telegramUser],
  );

  return <MiniAppContext.Provider value={value}>{children}</MiniAppContext.Provider>;
}

export function useMiniApp() {
  const context = useContext(MiniAppContext);
  if (!context) {
    throw new Error("useMiniApp must be used inside AppProviders");
  }
  return context;
}
