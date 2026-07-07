import { GameCard } from "@/components/game/GameCard";
import type { GameCardState } from "@/lib/types";

type GameBoardProps = {
  cards: GameCardState[];
  disabled: boolean;
  busyCardId: string | null;
  status: string;
  onOpenCard: (cardId: string) => void;
};

const placeholderCards = Array.from({ length: 9 }, (_, index) => ({
  card_id: `placeholder_${index}`,
  is_opened: false,
  is_matched: false,
  revealed_percent: null,
}));

export function GameBoard({ cards, disabled, busyCardId, status, onOpenCard }: GameBoardProps) {
  const displayCards = cards.length ? cards : placeholderCards;
  const celebrationActive = status === "completed" && displayCards.some((card) => card.is_matched);

  return (
    <section className="board-panel p-3.5 sm:p-4">
      {celebrationActive ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,232,255,0.1),transparent_34%),radial-gradient(circle_at_center,rgba(244,63,94,0.08),transparent_52%)]" />
      ) : null}
      <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-kicker">Игровое поле</p>
          <h2 className="font-display text-[1.65rem] font-semibold text-white min-[390px]:text-2xl">
            Открой пару
          </h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-nexx-muted">
          9 карт • 1 шанс
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {displayCards.map((card) => (
          <GameCard
            key={card.card_id}
            card={card}
            celebrationActive={celebrationActive}
            disabled={disabled || card.card_id.startsWith("placeholder")}
            busy={busyCardId === card.card_id}
            onClick={() => onOpenCard(card.card_id)}
          />
        ))}
      </div>
    </section>
  );
}
