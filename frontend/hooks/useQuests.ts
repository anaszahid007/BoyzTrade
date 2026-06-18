"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { gamificationService, Quest } from "@/services/gamification";

export function useQuests() {
  const { socket } = useSocket();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchQuests = useCallback(async () => {
    try {
      const data = await gamificationService.getQuests();
      setQuests(data);
      setError(null);
    } catch {
      setError("Failed to load quests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchQuests();
  }, [fetchQuests]);

  useEffect(() => {
    if (!socket) return;

    const handleQuestCompleted = (data: any) => {
      if (!data || typeof data !== "object") return;
      setQuests(prev =>
        prev.map(q =>
          q._id === data._id ? { ...q, completed: true, completedAt: data.completedAt } : q
        )
      );
    };

    const handleQuestsUpdate = (data: Quest[]) => {
      if (!Array.isArray(data)) return;
      setQuests(data);
    };

    socket.on("quest-completed", handleQuestCompleted);
    socket.on("quests-update", handleQuestsUpdate);
    return () => {
      socket.off("quest-completed", handleQuestCompleted);
      socket.off("quests-update", handleQuestsUpdate);
    };
  }, [socket]);

  const claimQuest = useCallback(async (userQuestId: string) => {
    try {
      await gamificationService.claimQuest(userQuestId);
      setQuests(prev =>
        prev.map(q =>
          q._id === userQuestId ? { ...q, claimed: true, claimedAt: new Date().toISOString() } : q
        )
      );
    } catch {
      // silent
    }
  }, []);

  return { quests, loading, error, refresh: fetchQuests, claimQuest };
}
