"use client";

import { useEffect, useState } from "react";

import { DiscountList } from "@/components/profile/DiscountList";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { fetchMyDiscounts } from "@/lib/api";
import { useMiniApp } from "@/lib/app-context";
import type { Discount } from "@/lib/types";

export default function ProfilePage() {
  const { initData, me, telegramUser, loading: appLoading, error: appError } = useMiniApp();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initData || appLoading) {
      return;
    }

    setLoading(false);
  }, [appLoading, initData]);

  useEffect(() => {
    if (!initData) {
      return;
    }

    let mounted = true;
    setLoading(true);
    fetchMyDiscounts(initData)
      .then((response) => {
        if (mounted) {
          setDiscounts(response.discounts);
        }
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError instanceof Error ? requestError.message : "Не удалось загрузить скидки.");
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
  }, [initData]);

  return (
    <PageContainer>
      <div className="space-y-5">
        <ProfileHeader me={me} telegramUser={telegramUser} />
        <DiscountList discounts={discounts} loading={loading} error={error ?? appError} />
      </div>

      <BottomNavigation isAdmin={me?.is_admin ?? false} />
    </PageContainer>
  );
}
