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

const LOCAL_DEV_INIT_DATA = "dev-local";
const TELEGRAM_CONTEXT_ERROR =
  "Приложение открыто как обычная ссылка, а не Telegram Mini App. Для игры нужна кнопка WebApp внутри Telegram.";

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

  const isLocalDev = typeof window !== "undefined" && window.location.hostname === "localhost";

  const refreshMe = async () => {
    if (!initData) {
      setLoading(false);
      setError(TELEGRAM_CONTEXT_ERROR);
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
      if (isLocalDev) {
        setInitData(LOCAL_DEV_INIT_DATA);
        setTelegramUser({
          id: 123456789,
          first_name: "Тест",
          last_name: "Локальный",
          username: "nexx_local",
        });
        return;
      }

      setTelegramUser(getTelegramUser());
      setLoading(false);
      setError(TELEGRAM_CONTEXT_ERROR);
      return;
    }

    setInitData(webApp.initData);
    setTelegramUser(getTelegramUser());
  }, [isLocalDev]);

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
