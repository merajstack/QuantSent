import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StockSearch } from "@/components/dashboard/stock-search";
import { StockInfoCard } from "@/components/dashboard/stock-info";
import { NewsFeed } from "@/components/dashboard/news-feed";
import { StockComparison } from "@/components/dashboard/stock-comparison";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useStockData } from "@/hooks/use-stock-data";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { useMarketTime } from "@/hooks/use-market-time";

interface StockInfo {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  sentiment: "positive" | "negative" | "neutral";
}

export default function Dashboard() {
  const [selectedStock, setSelectedStock] = useState<string>("");
  const { stockData, loading, error, fetchStock } = useStockData();
  const { marketTime, isMarketOpen } = useMarketTime();

  const handleStockSearch = async (symbol: string) => {
    setSelectedStock(symbol);
    await fetchStock(symbol);
  };

  // Auto-refresh stock data every 2 seconds if a stock is selected
  useAutoRefresh(() => {
    if (selectedStock) {
      fetchStock(selectedStock);
    }
  }, { enabled: !!selectedStock, interval: 2000 });

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-finance-gold/10 rounded-lg p-6 border border-primary/20">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            AI Market Sentiment Analyzer
          </h1>
          <p className="text-muted-foreground">
            Get real-time sentiment analysis and market insights powered by AI
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            {selectedStock && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Auto-refreshing {selectedStock} data every 2 seconds
              </div>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-sm">
              <div className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
              US Market {marketTime} ({isMarketOpen ? 'Open' : 'Closed'})
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <StockSearch 
              onSearch={handleStockSearch}
              currentPrice={stockData?.price}
              stockData={stockData}
            />
            
            <StockComparison />
            
            <StockInfoCard 
              stock={stockData}
              loading={loading}
              error={error}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <NewsFeed symbol={selectedStock} />
          </div>
        </div>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}