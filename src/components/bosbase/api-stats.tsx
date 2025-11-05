"use client";

import { useEffect, useState, useRef } from "react";
import { getBosbaseSDK, type ApiStats } from "@/lib/bosbase/sdk";
import { Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ApiStatsDisplay() {
  const [stats, setStats] = useState<ApiStats>({
    totalCalls: 0,
    callsToday: 0,
    callsThisMonth: 0,
  });
  const unsubscribeRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
        const sdk = getBosbaseSDK();
        const statsData = await sdk.getStats();
        if (mounted) {
          setStats(statsData);
        }
    };

    // Load initial stats
    loadStats();

    // Listen for refresh events
    const handleRefresh = () => {
      loadStats();
    };

    window.addEventListener("bosbase-stats-refresh", handleRefresh);

    return () => {
      mounted = false;
      window.removeEventListener("bosbase-stats-refresh", handleRefresh);
      if (unsubscribeRef.current) {
        unsubscribeRef.current().catch((error) => {
          console.error("Error unsubscribing from realtime:", error);
        });
        unsubscribeRef.current = null;
      }
    };
  }, []);


  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCalls.toLocaleString()}</div>
          <CardDescription className="text-xs">All time</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

