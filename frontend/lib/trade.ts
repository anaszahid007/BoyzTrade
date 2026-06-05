import apiFetch from "./api";

export interface PortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  current_value: number;
  profit_loss: number;
  profit_loss_percentage: string;
}

export interface PortfolioData {
  cash_balance: number;
  total_invested_value: number;
  total_portfolio_value: number;
  total_profit_loss: number;
  total_profit_loss_percentage: string;
  holdings: PortfolioHolding[];
}

export interface AssetSummary {
  symbol: string;
  name: string;
  market_type: string;
  current_price: number;
  logo?: string;
  market_cap: number;
  price_change_24h: number;
  last_updated: string;
}

export const tradeService = {
  async getPortfolio(): Promise<PortfolioData> {
    const response = await apiFetch<PortfolioData>("/api/trade/portfolio", {
      method: "GET",
    });
    return response.data;
  },

  async buyAsset(symbol: string, quantity: number): Promise<{ tradeId: string }> {
    const response = await apiFetch<{ tradeId: string }>("/api/trade/buy", {
      method: "POST",
      data: { symbol, quantity },
    });
    return response.data;
  },

  async sellAsset(symbol: string, quantity: number): Promise<{ tradeId: string }> {
    const response = await apiFetch<{ tradeId: string }>("/api/trade/sell", {
      method: "POST",
      data: { symbol, quantity },
    });
    return response.data;
  },

  async getAssets(query?: string, page = 1, perPage = 100): Promise<AssetSummary[]> {
    const queryString = query
      ? `?q=${encodeURIComponent(query)}&page=${page}&perPage=${perPage}`
      : `?page=${page}&perPage=${perPage}`;

    const response = await apiFetch<AssetSummary[]>(`/api/assets${queryString}`, {
      method: "GET",
    });

    return response.data;
  },

  async getAssetBySymbol(symbol: string): Promise<AssetSummary> {
    const response = await apiFetch<AssetSummary>(`/api/assets/${symbol.toUpperCase()}`, {
      method: "GET",
    });

    return response.data;
  },

  async getTradeHistory(page = 1, perPage = 20): Promise<any[]> {
    const response = await apiFetch<any>(`/api/trade/history?page=${page}&perPage=${perPage}`, {
      method: "GET",
    });

    return response.data;
  },
};
