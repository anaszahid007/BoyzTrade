import apiFetch from "@/utils/api";

export interface WatchlistAsset {
  _id: string;
  symbol: string;
  name: string;
  logo?: string;
  current_price: number;
  price_change_24h: number;
  market_cap: number;
  addedAt: string;
}

export const watchlistService = {
  async list(): Promise<WatchlistAsset[]> {
    const response = await apiFetch<{ watchlist: WatchlistAsset[] }>(
      "/api/watchlist",
      { method: "GET" }
    );
    return response.data.watchlist;
  },

  async add(symbol: string): Promise<void> {
    await apiFetch("/api/watchlist", {
      method: "POST",
      data: { symbol },
    });
  },

  async remove(symbol: string): Promise<void> {
    await apiFetch(`/api/watchlist/${symbol}`, {
      method: "DELETE",
    });
  },
};
