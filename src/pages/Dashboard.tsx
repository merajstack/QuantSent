import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StockSearch } from "@/components/dashboard/stock-search";
import { StockInfoCard } from "@/components/dashboard/stock-info";
import { NewsFeed } from "@/components/dashboard/news-feed";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useStockData } from "@/hooks/use-stock-data";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

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

  const handleStockSearch = async (symbol: string) => {
    setSelectedStock(symbol);
    await fetchStock(symbol);
  };

  // Auto-refresh stock data every 3 seconds if a stock is selected
  useAutoRefresh(() => {
    if (selectedStock) {
      fetchStock(selectedStock);
    }
  }, { enabled: !!selectedStock, interval: 3000 });

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
          {selectedStock && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Auto-refreshing {selectedStock} data every 3 seconds
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <StockSearch 
              onSearch={handleStockSearch}
              currentPrice={stockData?.price}
            />
            
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