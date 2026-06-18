"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { gamificationService, Badge } from "@/services/gamification";

export function useBadges() {
  const { socket } = useSocket();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchBadges = useCallback(async () => {
    try {
      const data = await gamificationService.getBadges();
      setBadges(data);
      setError(null);
    } catch {
      setError("Failed to load badges");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchBadges();
  }, [fetchBadges]);

  useEffect(() => {
    if (!socket) return;

    const handleBadgeEarned = (data: Badge) => {
      if (!data || typeof data !== "object") return;
      setBadges(prev =>
        prev.map(b => (b._id === data._id ? { ...b, earned: true, earnedAt: data.earnedAt } : b))
      );
    };

    socket.on("badge-earned", handleBadgeEarned);
    return () => {
      socket.off("badge-earned", handleBadgeEarned);
    };
  }, [socket]);

  return { badges, loading, error, refresh: fetchBadges };
}

export function useEarnedBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    try {
      const data = await gamificationService.getEarnedBadges();
      setBadges(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBadges(); }, [fetchBadges]);

  return { badges, loading, refresh: fetchBadges };
}
