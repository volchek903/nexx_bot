"use client";

import { type FormEvent, useState } from "react";

import { deactivateDiscountsForUser, findAdminUserByUsername } from "@/lib/api";
import type { AdminUserLookup } from "@/lib/types";

type AdminDiscountDeactivationProps = {
  initData: string | null;
  onDiscountDeactivated?: () => Promise<void> | void;
};

const discountStatusLabel: Record<string, string> = {
  active: "активна",
  used: "использована",
  expired: "истекла",
};

function formatDate(value: string | null): string {
  if (!value) {
    return "не задан";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getDisplayName(user: AdminUserLookup): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return fullName || "Пользователь без имени";
}

export function AdminDiscountDeactivation({
  initData,
  onDiscountDeactivated,
}: AdminDiscountDeactivationProps) {
  const [username, setUsername] = useState("");
  const [candidate, setCandidate] = useState<AdminUserLookup | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!initData) {
      setError("Нет Telegram-авторизации. Обновите страницу админки.");
      return;
    }

    if (!username.trim()) {
      setCandidate(null);
      setSuccess(null);
      setError("Введите username пользователя.");
      return;
    }

    setLookupLoading(true);
    setCandidate(null);
    setError(null);
    setSuccess(null);

    try {
      const response = await findAdminUserByUsername(initData, username);
      setCandidate(response);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось найти пользователя.");
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleDeactivate() {
    if (!initData || !candidate) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await deactivateDiscountsForUser(initData, candidate.user_id);
      setCandidate({
        ...candidate,
        active_discount: null,
        active_discount_count: 0,
      });
      setSuccess(
        response.deactivated_discounts > 1
          ? `У пользователя @${response.username ?? candidate.username ?? "unknown"} деактивировано ${response.deactivated_discounts} активных скидки.`
          : `Скидка пользователя @${response.username ?? candidate.username ?? "unknown"} деактивирована.`,
      );
      try {
        await onDiscountDeactivated?.();
      } catch {
        // Parent refresh failure should not hide a successful deactivation result.
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось деактивировать скидку.");
    } finally {
      setActionLoading(false);
    }
  }

  function resetCandidate() {
    setCandidate(null);
    setError(null);
    setSuccess(null);
  }

  return (
    <section className="glass-panel p-5">
      <div className="mb-4">
        <p className="section-kicker">Панель Nexx / скидки</p>
        <h2 className="font-display text-2xl font-semibold text-white">Деактивация скидки по username</h2>
        <p className="mt-2 text-sm leading-6 text-nexx-muted">
          Введите Telegram username пользователя, проверьте карточку и подтвердите, что это нужный человек.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleLookup}>
        <label className="block">
          <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-nexx-muted">
            Username Telegram
          </span>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="@username"
              autoComplete="off"
              className="w-full rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition focus:border-cyan-300/40 focus:bg-white/[0.08] placeholder:text-white/30"
            />
            <button
              type="submit"
              disabled={lookupLoading || actionLoading}
              className="brand-button w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
            >
              {lookupLoading ? "Ищем…" : "Найти пользователя"}
            </button>
          </div>
        </label>
      </form>

      {error ? (
        <div className="mt-4 rounded-[22px] border border-rose-400/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-[22px] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100">
          {success}
        </div>
      ) : null}

      {candidate ? (
        <div className="mt-4 space-y-4 rounded-[28px] border border-white/10 bg-white/[0.035] p-4 shadow-[0_18px_36px_rgba(4,5,17,0.18)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="section-kicker">Подтверждение</p>
              <h3 className="mt-2 font-display text-2xl text-white">{getDisplayName(candidate)}</h3>
              <p className="mt-1 text-sm text-nexx-muted">@{candidate.username ?? "без username"}</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-white/80">
              Telegram ID {candidate.telegram_id}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="discount-fact">
              <span className="discount-fact-label">Username</span>
              <span className="discount-fact-value">@{candidate.username ?? "не указан"}</span>
            </div>
            <div className="discount-fact">
              <span className="discount-fact-label">Активных скидок</span>
              <span className="discount-fact-value">{candidate.active_discount_count}</span>
            </div>
            <div className="discount-fact">
              <span className="discount-fact-label">Текущая скидка</span>
              <span className="discount-fact-value">
                {candidate.active_discount ? `${candidate.active_discount.percent}%` : "активной скидки нет"}
              </span>
            </div>
            <div className="discount-fact">
              <span className="discount-fact-label">Статус</span>
              <span className="discount-fact-value">
                {candidate.active_discount
                  ? (discountStatusLabel[candidate.active_discount.status] ?? candidate.active_discount.status)
                  : "нечего деактивировать"}
              </span>
            </div>
            <div className="discount-fact">
              <span className="discount-fact-label">Получена</span>
              <span className="discount-fact-value">
                {candidate.active_discount ? formatDate(candidate.active_discount.created_at) : "—"}
              </span>
            </div>
            <div className="discount-fact">
              <span className="discount-fact-label">Истекает</span>
              <span className="discount-fact-value">
                {candidate.active_discount ? formatDate(candidate.active_discount.expires_at) : "—"}
              </span>
            </div>
          </div>

          <div className="empty-well p-4">
            <p className="font-display text-lg text-white">Это верный пользователь?</p>
            <p className="mt-2 text-sm leading-6 text-nexx-muted">
              Если нажмёте «Да», все активные скидки пользователя с этим username будут деактивированы.
            </p>
            {candidate.active_discount_count > 1 ? (
              <p className="mt-2 text-sm leading-6 text-amber-200">
                У пользователя найдено несколько активных скидок. Будут деактивированы все активные записи.
              </p>
            ) : null}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="secondary-button w-full sm:w-auto" onClick={resetCandidate}>
                Нет, очистить
              </button>
              <button
                type="button"
                className="brand-button w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleDeactivate}
                disabled={actionLoading || candidate.active_discount_count === 0}
              >
                {actionLoading
                  ? "Деактивируем…"
                  : candidate.active_discount_count > 0
                    ? "Да, деактивировать скидку"
                    : "Активной скидки нет"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
