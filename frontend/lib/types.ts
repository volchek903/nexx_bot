export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

export type MeResponse = {
  id: number;
  telegram_id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
  is_admin: boolean;
  game_status: string;
};

export type Discount = {
  id: number;
  percent: number;
  status: string;
  created_at: string;
  used_at: string | null;
  expires_at: string | null;
};

export type DiscountShort = {
  percent: number;
  status: string;
};

export type GameCardState = {
  card_id: string;
  is_opened: boolean;
  is_matched: boolean;
  revealed_percent: number | null;
};

export type GameStateResponse = {
  game_id: number | null;
  status: string;
  opened_cards_count: number;
  cards: GameCardState[];
  discount: DiscountShort | null;
  message?: string | null;
};

export type OpenCardPayload = {
  game_id: number;
  card_id: string;
};

export type OpenCardResponse = {
  status: string;
  opened_card?: {
    card_id: string;
    revealed_percent: number;
  } | null;
  match?: boolean | null;
  matched_cards?: string[] | null;
  should_close_cards?: string[] | null;
  discount?: DiscountShort | null;
  message?: string | null;
};

export type DiscountsResponse = {
  discounts: Discount[];
};

export type AdminStats = {
  users_total: number;
  miniapp_opened: number;
  games_started: number;
  games_completed: number;
  active_discounts: number;
  used_discounts: number;
  expired_discounts: number;
  discounts_by_percent: Record<string, number>;
};
