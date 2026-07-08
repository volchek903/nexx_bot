import type {
  AdminStats,
  DiscountsResponse,
  GameStateResponse,
  MeResponse,
  OpenCardPayload,
  OpenCardResponse,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
    const message =
      error instanceof Error && error.message === "Failed to fetch"
        ? "Не удалось связаться с сервером. Проверьте адрес API и что backend запущен."
        : "Не удалось выполнить запрос. Проверьте подключение и настройки API.";
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
