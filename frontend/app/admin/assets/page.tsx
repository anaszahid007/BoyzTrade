"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService, AdminAsset } from "@/services/admin";
import {
  Database,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  DollarSign,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AssetsManagement() {
  const { user } = useAuth();
  
  // Data state
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Query state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalAsset, setEditModalAsset] = useState<AdminAsset | null>(null);
  
  // Form States
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [marketType, setMarketType] = useState("crypto");
  const [price, setPrice] = useState("");
  const [logo, setLogo] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getAssets({
        page,
        limit: 15,
        search
      });
      setAssets(response.data || []);
      const pagination = (response as any).pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch assets");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAssets();
    }
  }, [user, fetchAssets]);

  const handleCreateAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !name) {
      alert("Symbol and Name are required");
      return;
    }
    
    setFormLoading(true);
    try {
      const parsedPrice = parseFloat(price) || 0;
      await adminService.createAsset({
        symbol: symbol.toUpperCase(),
        name,
        marketType,
        currentPrice: parsedPrice,
        logo: logo || undefined,
        assetId: symbol.toLowerCase()
      });
      
      setCreateModalOpen(false);
      setSymbol("");
      setName("");
      setPrice("");
      setLogo("");
      
      fetchAssets();
    } catch (err: any) {
      alert(err.message || "Failed to create asset");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalAsset) return;

    setFormLoading(true);
    try {
      const parsedPrice = parseFloat(price) || 0;
      await adminService.updateAsset(editModalAsset._id, {
        currentPrice: parsedPrice,
        logo: logo || undefined
      });
      
      setEditModalAsset(null);
      setPrice("");
      setLogo("");
      
      fetchAssets();
    } catch (err: any) {
      alert(err.message || "Failed to update asset");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAsset = async (assetId: string, assetSymbol: string) => {
    if (!confirm(`Are you sure you want to delete ${assetSymbol} from the catalog? This might break user portfolios referencing this asset.`)) {
      return;
    }

    try {
      await adminService.deleteAsset(assetId);
      setAssets(prev => prev.filter(a => a._id !== assetId));
    } catch (err: any) {
      alert(err.message || "Failed to delete asset");
    }
  };

  const openEditModal = (asset: AdminAsset) => {
    setEditModalAsset(asset);
    setPrice(String(asset.currentPrice));
    setLogo(asset.logo || "");
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass p-6 rounded-xl border border-white/5 text-center">
          <p className="text-success font-bold">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-[10px] text-success font-bold hover:underline mb-1">
            <ArrowLeft className="w-3 h-3" />
            Back to Admin Terminal
          </Link>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-success" />
            Asset Catalog Management
          </h1>
          <p className="text-[11px] text-muted-foreground">List custom tokens/stocks, adjust prices, edit metadata, or prune assets database.</p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant="secondary" 
            onClick={fetchAssets} 
            className="text-[10px] h-8 font-bold border-white/5 hover:border-success/20 transition-all"
          >
            <RefreshCcw className="w-3 h-3 mr-1.5" />
            Sync
          </Button>
          <Button 
            onClick={() => setCreateModalOpen(true)} 
            className="text-[10px] h-8 font-bold rounded-lg group relative overflow-hidden flex items-center bg-gradient-to-r from-success to-success/80 border border-success/30 hover:bg-success/90"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            List Asset
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass p-4 rounded-xl border border-white/5">
        <div className="relative group max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-success transition-colors" />
          <input
            type="text"
            placeholder="Filter by asset symbol or name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-muted-foreground text-[8px] uppercase tracking-[0.2em] font-bold">
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Market Type</th>
                <th className="px-4 py-3 text-right">Manually Stored Price</th>
                <th className="px-4 py-3 text-right">Created At</th>
                <th className="px-4 py-3 text-center">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-success/30 border-t-success rounded-full animate-spin mx-auto mb-2" />
                    Querying assets...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    No assets currently listed. List an asset using the button above.
                  </td>
                </tr>
              ) : (
                assets.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.01] transition-all">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {item.logo ? (
                          <img src={item.logo} alt={item.symbol} className="w-7 h-7 rounded-lg object-cover border border-white/5" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 grid place-items-center text-[9px] font-bold text-muted-foreground">
                            {item.symbol.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-xs leading-none mb-0.5">{item.symbol}</p>
                          <p className="text-[9px] text-muted-foreground">{item.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 border border-white/5 text-muted-foreground uppercase">
                        {item.marketType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-bold tracking-tight text-success">
                      ${item.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[10px] text-muted-foreground font-mono">
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit Ticker Price/Logo"
                          className="p-1 bg-white/5 hover:bg-success/20 border border-white/5 hover:border-success/30 rounded text-muted-foreground hover:text-success transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(item._id, item.symbol)}
                          title="Remove Asset Ticker"
                          className="p-1 bg-white/5 hover:bg-success/25 border border-white/5 hover:border-success/40 rounded text-muted-foreground hover:text-success transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white/2 border-t border-white/5 px-4 py-3 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Page <span className="text-foreground font-bold">{page}</span> of <span className="text-foreground font-bold">{totalPages}</span>
            </span>
            <div className="inline-flex items-center gap-1.5">
              <Button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1 h-7 w-7 rounded-md border border-white/5 flex items-center justify-center disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1 h-7 w-7 rounded-md border border-white/5 flex items-center justify-center disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Asset Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass w-full max-w-md border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => { setCreateModalOpen(false); }}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleCreateAssetSubmit} className="p-6 space-y-4 font-sans">
              <div className="space-y-1">
                <h3 className="text-sm font-bold tracking-tight">List New Database Asset</h3>
                <p className="text-[10px] text-muted-foreground">
                  Manually register a mock/custom coin ticker to enable virtual trades.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Symbol
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BTC"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bitcoin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Market Type
                  </label>
                  <select
                    value={marketType}
                    onChange={(e) => setMarketType(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-muted-foreground focus:outline-none focus:border-success/50 focus:bg-white/10 focus:text-foreground transition-all appearance-none cursor-pointer font-sans"
                  >
                    <option value="crypto" className="bg-[#0b0c10]">Crypto</option>
                    <option value="stock" className="bg-[#0b0c10]">Stock</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Initial Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="e.g. 64000.50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Logo Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCreateModalOpen(false)}
                  className="w-full text-xs font-bold py-2 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={formLoading}
                  className="w-full text-xs font-bold py-2 rounded-lg bg-success border border-success/30 text-white hover:bg-success/80"
                >
                  List Ticker
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ticker Modal */}
      {editModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass w-full max-w-md border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => { setEditModalAsset(null); setPrice(""); setLogo(""); }}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleEditAssetSubmit} className="p-6 space-y-4 font-sans">
              <div className="space-y-1">
                <h3 className="text-sm font-bold tracking-tight">Edit Database Asset Ticker</h3>
                <p className="text-[10px] text-muted-foreground">
                  Configure asset price and logo values for <span className="text-success font-bold">{editModalAsset.symbol}</span> ({editModalAsset.name}).
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Current Stored Price (USD)
                  </label>
                  <div className="relative group">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="number"
                      step="0.000001"
                      required
                      placeholder="e.g. 1.25"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Logo Image URL
                  </label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setEditModalAsset(null); setPrice(""); setLogo(""); }}
                  className="w-full text-xs font-bold py-2 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={formLoading}
                  className="w-full text-xs font-bold py-2 rounded-lg bg-success border border-success/30 text-white hover:bg-success/80"
                >
                  Update Asset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
