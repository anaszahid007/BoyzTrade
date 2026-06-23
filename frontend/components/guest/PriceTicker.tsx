import { Activity } from "lucide-react";

const tickerAssets = [
  { symbol: "BTC", price: 67432, change: 2.41 },
  { symbol: "ETH", price: 3456, change: 1.82 },
  { symbol: "SOL", price: 143.28, change: -0.63 },
  { symbol: "AVAX", price: 38.92, change: 5.14 },
  { symbol: "LINK", price: 17.65, change: -1.23 },
  { symbol: "MATIC", price: 0.72, change: 3.87 },
  { symbol: "DOT", price: 7.84, change: 0.95 },
  { symbol: "UNI", price: 9.43, change: -2.18 },
];

function PriceTicker() {
  return (
    <div className="relative z-40 border-b border-bg-border bg-white/[0.02] backdrop-blur-sm">
      
      <div className="flex items-center">

        {/* TICKER WRAPPER */}
        <div className="relative flex-1 overflow-hidden">
          
          {/* LEFT FADE */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-bg-dark to-transparent" />

          {/* RIGHT FADE */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-bg-dark to-transparent" />

          {/* MARQUEE TRACK */}
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            
            {[...tickerAssets, ...tickerAssets].map((asset, index) => (
              <div
                key={`${asset.symbol}-${index}`}
                className="flex items-center gap-3 px-6 py-2 whitespace-nowrap"
              >
                {/* SYMBOL */}
                <span className="text-[11px] font-bold text-muted-foreground">
                  {asset.symbol}
                </span>

                {/* PRICE */}
                <span className="text-[11px] font-mono font-bold tabular-nums text-foreground">
                  ${asset.price.toLocaleString()}
                </span>

                {/* CHANGE */}
                <span
                  className={`flex items-center gap-1 text-[10px] font-bold ${
                    asset.change >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  <span
                    className={`inline-block w-0 h-0 border-l-[3px] border-r-[3px] ${
                      asset.change >= 0
                        ? "border-b-[4px] border-b-current border-l-transparent border-r-transparent"
                        : "border-t-[4px] border-t-current border-l-transparent border-r-transparent"
                    }`}
                  />
                  {Math.abs(asset.change)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceTicker;