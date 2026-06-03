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
};
