"use client";

import { useEffect, useState } from "react";

import { AdminOnlyGuard } from "@/components/admin/AdminOnlyGuard";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { DiscountStatsChart } from "@/components/admin/DiscountStatsChart";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { fetchAdminStats } from "@/lib/api";
import { useMiniApp } from "@/lib/app-context";
import type { AdminStats } from "@/lib/types";

export default function AdminPage() {
  const { initData, me, loading: appLoading, error: appError } = useMiniApp();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appLoading || !initData || !me?.is_admin) {
      if (!appLoading) {
        setLoading(false);
      }
      return;
    }

    let mounted = true;
    setLoading(true);
    fetchAdminStats(initData)
      .then((response) => {
        if (mounted) {
          setStats(response);
        }
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError instanceof Error ? requestError.message : "Не удалось загрузить статистику.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [appLoading, initData, me?.is_admin]);

  return (
    <PageContainer>
      <AdminOnlyGuard isAdmin={me?.is_admin ?? false} loading={appLoading}>
        <div className="space-y-5">
          <div className="hero-panel p-5">
            <p className="section-kicker">Панель Nexx / аналитика</p>
            <h1 className="font-display text-3xl font-semibold text-white">Админка</h1>
            <p className="mt-2 text-sm text-nexx-muted">
              Статистика по открытиям мини-приложения, играм и выданным скидкам.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="hero-chip">
                <span className="hero-chip-label">Режим</span>
                <span className="hero-chip-value">работа</span>
              </div>
              <div className="hero-chip">
                <span className="hero-chip-label">Источник</span>
                <span className="hero-chip-value">живая база</span>
              </div>
              <div className="hero-chip">
                <span className="hero-chip-label">Фокус</span>
                <span className="hero-chip-value">акция</span>
              </div>
            </div>
          </div>

          <AdminStatsCards stats={stats} loading={loading} error={error ?? appError} />
          <DiscountStatsChart stats={stats} loading={loading} />
        </div>
      </AdminOnlyGuard>

      <BottomNavigation isAdmin={me?.is_admin ?? false} />
    </PageContainer>
  );
}
