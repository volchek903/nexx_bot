import { GameCard } from "@/components/game/GameCard";
import type { GameCardState } from "@/lib/types";

type GameBoardProps = {
  cards: GameCardState[];
  disabled: boolean;
  busyCardId: string | null;
  onOpenCard: (cardId: string) => void;
};

const placeholderCards = Array.from({ length: 9 }, (_, index) => ({
  card_id: `placeholder_${index}`,
  is_opened: false,
  is_matched: false,
  revealed_percent: null,
}));

export function GameBoard({ cards, disabled, busyCardId, onOpenCard }: GameBoardProps) {
  const displayCards = cards.length ? cards : placeholderCards;

  return (
    <section className="glass-panel p-4">
      <div className="grid grid-cols-3 gap-3">
        {displayCards.map((card) => (
          <GameCard
            key={card.card_id}
            card={card}
            disabled={disabled || card.card_id.startsWith("placeholder")}
            busy={busyCardId === card.card_id}
            onClick={() => onOpenCard(card.card_id)}
          />
        ))}
      </div>
    </section>
  );
}
