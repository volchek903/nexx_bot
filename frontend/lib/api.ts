import type {
  AdminStats,
  DiscountsResponse,
  GameStateResponse,
  MeResponse,
  OpenCardPayload,
  OpenCardResponse,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const LOCAL_API_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function isLocalHostname(hostname: string): boolean {
  return LOCAL_API_HOSTS.has(hostname) || hostname.startsWith("127.");
}

function getApiConfigurationError(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  let apiUrl: URL;
  try {
    apiUrl = new URL(API_BASE_URL);
  } catch {
    return null;
  }

  const frontendIsLocal = isLocalHostname(window.location.hostname);
  if (frontendIsLocal) {
    return null;
  }

  if (isLocalHostname(apiUrl.hostname)) {
    return "Фронтенд открыт не локально, но NEXT_PUBLIC_API_URL указывает на localhost. Укажите публичный HTTPS-адрес API.";
  }

  if (apiUrl.protocol !== "https:") {
    return "Для Telegram Mini App API должен быть доступен по HTTPS. Обновите NEXT_PUBLIC_API_URL.";
  }

  return null;
}

async function request<T>(path: string, initData: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("X-Telegram-Init-Data", initData);
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    const configError = getApiConfigurationError();
    const message =
      configError ??
      (error instanceof Error && error.message === "Failed to fetch"
        ? "Не удалось связаться с сервером. Проверьте адрес API и что backend запущен."
        : "Не удалось выполнить запрос. Проверьте подключение и настройки API.");
    throw new Error(message);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error ?? payload?.detail ?? "Запрос завершился ошибкой.";
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function fetchMe(initData: string) {
  return request<MeResponse>("/api/me", initData);
}

export function startGame(initData: string) {
  return request<GameStateResponse>("/api/game/start", initData, {
    method: "POST",
  });
}

export function fetchGameState(initData: string) {
  return request<GameStateResponse>("/api/game/state", initData);
}

export function openCard(initData: string, payload: OpenCardPayload) {
  return request<OpenCardResponse>("/api/game/open-card", initData, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMyDiscounts(initData: string) {
  return request<DiscountsResponse>("/api/discounts/my", initData);
}

export function fetchAdminStats(initData: string) {
  return request<AdminStats>("/api/admin/stats", initData);
}
