"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { GameBoard } from "@/components/game/GameBoard";
import { GameStatus } from "@/components/game/GameStatus";
import { RulesModal } from "@/components/game/RulesModal";
import { WinModal } from "@/components/game/WinModal";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { LogoHeader } from "@/components/layout/LogoHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { startGame, fetchGameState, openCard as openCardRequest } from "@/lib/api";
import { useMiniApp } from "@/lib/app-context";
import type { GameCardState, GameStateResponse } from "@/lib/types";

const RULES_STORAGE_KEY = "nexx_rules_seen";

function cloneCards(cards: GameCardState[]): GameCardState[] {
  return cards.map((card) => ({ ...card }));
}

export default function GamePage() {
  const router = useRouter();
  const { initData, me, loading: appLoading, error: appError, refreshMe } = useMiniApp();
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const [loadingGame, setLoadingGame] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyCardId, setBusyCardId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [winPercent, setWinPercent] = useState<number | null>(null);
  const mismatchTimer = useRef<number | null>(null);
  const winTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (mismatchTimer.current) {
        window.clearTimeout(mismatchTimer.current);
      }
      if (winTimer.current) {
        window.clearTimeout(winTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initData || appLoading) {
      return;
    }

    setLoadingGame(false);
  }, [appLoading, initData]);

  useEffect(() => {
    if (!initData) {
      return;
    }

    let mounted = true;
    setLoadingGame(true);
    setError(null);

    startGame(initData)
      .then((response) => {
        if (!mounted) {
          return;
        }
        setGameState(response);
        const rulesSeen = window.localStorage.getItem(RULES_STORAGE_KEY) === "1";
        setShowRules(response.status !== "blocked" && !rulesSeen);
      })
      .catch((requestError) => {
        if (!mounted) {
          return;
        }
        setError(requestError instanceof Error ? requestError.message : "Не удалось загрузить игру.");
      })
      .finally(() => {
        if (mounted) {
          setLoadingGame(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [initData]);

  const lockedPercent = useMemo(() => gameState?.discount?.percent ?? null, [gameState?.discount?.percent]);
  const statusError = useMemo(() => error ?? (gameState ? null : appError), [appError, error, gameState]);

  const syncState = async () => {
    if (!initData) {
      return;
    }
    const response = await fetchGameState(initData);
    setGameState(response);
  };

  const handleCloseRules = () => {
    window.localStorage.setItem(RULES_STORAGE_KEY, "1");
    setShowRules(false);
  };

  const handleOpenCard = async (cardId: string) => {
    if (!initData || !gameState?.game_id || busyCardId || gameState.status !== "in_progress") {
      return;
    }

    setBusyCardId(cardId);
    setError(null);

    try {
      const response = await openCardRequest(initData, {
        game_id: gameState.game_id,
        card_id: cardId,
      });

      if (response.status === "blocked") {
        await syncState();
        setError(response.message ?? "Повторная игра недоступна.");
        return;
      }

      if (response.opened_card) {
        const openedCard = response.opened_card;
        setGameState((current) => {
          if (!current) {
            return current;
          }

          const cards = cloneCards(current.cards);
          const target = cards.find((card) => card.card_id === openedCard.card_id);
          if (target) {
            target.is_opened = true;
            target.revealed_percent = openedCard.revealed_percent;
          }

          if (response.match && response.matched_cards) {
            for (const matchedCardId of response.matched_cards) {
              const card = cards.find((item) => item.card_id === matchedCardId);
              if (card) {
                card.is_opened = true;
                card.is_matched = true;
                card.revealed_percent = response.discount?.percent ?? openedCard.revealed_percent;
              }
            }
          }

          return {
            ...current,
            status: response.status,
            cards,
            discount: response.discount ?? current.discount,
            opened_cards_count: cards.filter((card) => card.is_opened || card.is_matched).length,
          };
        });
      }

      if (response.match === false && response.should_close_cards) {
        mismatchTimer.current = window.setTimeout(async () => {
          setGameState((current) => {
            if (!current) {
              return current;
            }
            const cards = cloneCards(current.cards);
            for (const closingId of response.should_close_cards ?? []) {
              const card = cards.find((item) => item.card_id === closingId);
              if (card && !card.is_matched) {
                card.is_opened = false;
                card.revealed_percent = null;
              }
            }
            return {
              ...current,
              cards,
              opened_cards_count: cards.filter((card) => card.is_opened || card.is_matched).length,
            };
          });
          await syncState();
        }, 1200);
      }

      if (response.status === "completed" && response.discount) {
        void refreshMe();
        winTimer.current = window.setTimeout(() => {
          setWinPercent(response.discount?.percent ?? null);
        }, 900);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось открыть карточку.");
      await syncState().catch(() => undefined);
    } finally {
      setBusyCardId(null);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        <LogoHeader
          title="Найди свою скидку"
          subtitle="Открой карточки Nexx и забери до 50% скидки на аренду игровой комнаты."
        />

        <GameStatus
          loading={loadingGame}
          status={gameState?.status ?? "not_started"}
          error={statusError}
          discountPercent={lockedPercent}
        />

        <GameBoard
          cards={gameState?.cards ?? []}
          disabled={loadingGame || !!busyCardId || gameState?.status !== "in_progress"}
          busyCardId={busyCardId}
          status={gameState?.status ?? "not_started"}
          onOpenCard={handleOpenCard}
        />

        <section className="glass-panel p-4 sm:p-5">
          <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="section-kicker">Как играть</p>
            <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-[0.66rem] uppercase tracking-[0.18em] text-cyan-100">
              режим акции
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="info-tile">
              <span className="info-tile-index">01</span>
              <p className="info-tile-title">Открывай</p>
              <p className="info-tile-text">Открой любую карточку и смотри, какой процент скрыт на поле.</p>
            </div>
            <div className="info-tile">
              <span className="info-tile-index">02</span>
              <p className="info-tile-title">Сравнивай</p>
              <p className="info-tile-text">Вам нужно угадать, где находятся 2 одинаковые карточки со скидкой.</p>
            </div>
            <div className="info-tile">
              <span className="info-tile-index">03</span>
              <p className="info-tile-title">Забирай</p>
              <p className="info-tile-text">Если вам дважды выпадет один и тот же процент, именно эта скидка станет вашим призом.</p>
            </div>
          </div>
        </section>
      </div>

      <BottomNavigation isAdmin={me?.is_admin ?? false} />

      {showRules ? <RulesModal onStart={handleCloseRules} /> : null}

      {winPercent ? (
        <WinModal
          percent={winPercent}
          onStay={() => setWinPercent(null)}
          onProfile={() => router.push("/profile")}
        />
      ) : null}
    </PageContainer>
  );
}
