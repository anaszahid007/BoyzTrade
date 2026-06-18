"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { gamificationService, GamificationProfile } from "@/services/gamification";

export function useGamification() {
  const { socket } = useSocket();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await gamificationService.getProfile();
      setProfile(data);
      setError(null);
    } catch {
      setError("Failed to load gamification profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data: GamificationProfile) => {
      if (!data || typeof data !== "object") return;
      setProfile(data);
    };

    socket.on("gamification-update", handleUpdate);
    return () => {
      socket.off("gamification-update", handleUpdate);
    };
  }, [socket]);

  return { profile, loading, error, refresh: fetchProfile };
}
