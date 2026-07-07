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
          <div className="glass-panel p-5">
            <p className="section-kicker">Nexx Control</p>
            <h1 className="font-display text-3xl font-semibold text-white">Админка</h1>
            <p className="mt-2 text-sm text-nexx-muted">
              Статистика по открытиям Mini App, играм и выданным скидкам.
            </p>
          </div>

          <AdminStatsCards stats={stats} loading={loading} error={error ?? appError} />
          <DiscountStatsChart stats={stats} loading={loading} />
        </div>
      </AdminOnlyGuard>

      <BottomNavigation isAdmin={me?.is_admin ?? false} />
    </PageContainer>
  );
}
