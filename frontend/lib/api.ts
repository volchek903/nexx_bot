import type {
  AdminStats,
  DiscountsResponse,
  GameStateResponse,
  MeResponse,
  OpenCardPayload,
  OpenCardResponse,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 8000;

const LOCAL_API_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function isLocalHostname(hostname: string): boolean {
  return LOCAL_API_HOSTS.has(hostname) || hostname.startsWith("127.");
}

function buildApiUrl(baseUrl: string, path: string): string {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedBaseUrl.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${normalizedBaseUrl}${normalizedPath.slice(4)}`;
  }

  return `${normalizedBaseUrl}${normalizedPath}`;
}

function resolveApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return API_BASE_URL;
  }

  let apiUrl: URL;
  try {
    apiUrl = new URL(API_BASE_URL);
  } catch {
    return API_BASE_URL;
  }

  const frontendIsLocal = isLocalHostname(window.location.hostname);
  if (frontendIsLocal) {
    return API_BASE_URL;
  }

  if (isLocalHostname(apiUrl.hostname) || apiUrl.protocol !== "https:") {
    return window.location.origin;
  }

  return API_BASE_URL;
}

async function request<T>(path: string, initData: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("X-Telegram-Init-Data", initData);
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  const apiBaseUrl = resolveApiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(buildApiUrl(apiBaseUrl, path), {
      ...options,
      headers,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "AbortError"
        ? "Сервер отвечает слишком долго. Попробуйте ещё раз через несколько секунд."
        : error instanceof Error && error.message === "Failed to fetch"
          ? "Не удалось связаться с сервером. Проверьте адрес API и что backend запущен."
          : "Не удалось выполнить запрос. Проверьте подключение и настройки API.";
    throw new Error(message);
  } finally {
    clearTimeout(timeoutId);
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
