import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StockSearch } from "@/components/dashboard/stock-search";
import { StockInfoCard } from "@/components/dashboard/stock-info";
import { NewsFeed } from "@/components/dashboard/news-feed";
import { Watchlist } from "@/components/dashboard/watchlist";
import { EmailNotifications } from "@/components/dashboard/email-notifications";
import { TrendingUp, Activity, DollarSign } from "lucide-react";
import quantsentHero from "@/assets/quantsent-hero.jpg";

const Index = () => {
  const [currentStock, setCurrentStock] = useState<any>(null);
  const [searchedSymbol, setSearchedSymbol] = useState("");

  const handleStockSearch = (symbol: string) => {
    setSearchedSymbol(symbol);
    // Simulate API data
    setCurrentStock({
      symbol,
      price: Math.random() * 500 + 100,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 5,
      lastUpdated: new Date().toLocaleTimeString(),
      sentiment: Math.random() > 0.6 ? "positive" : Math.random() > 0.3 ? "neutral" : "negative"
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">QuantSent Dashboard</h1>
                <p className="text-white/80">AI-powered stock market sentiment analysis</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Market Status</span>
                </div>
                <div className="text-2xl font-bold">OPEN</div>
                <div className="text-sm text-white/80">NYSE • NASDAQ</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5" />
                  <span className="font-medium">Active Stocks</span>
                </div>
                <div className="text-2xl font-bold">2,847</div>
                <div className="text-sm text-white/80">Being monitored</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-medium">Sentiment Score</span>
                </div>
                <div className="text-2xl font-bold">+0.34</div>
                <div className="text-sm text-white/80">Slightly Positive</div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Stock Search */}
          <div className="xl:col-span-1">
            <StockSearch 
              onSearch={handleStockSearch}
              currentPrice={currentStock?.price}
            />
          </div>

          {/* Stock Info */}
          <div className="xl:col-span-1">
            <StockInfoCard stock={currentStock} />
          </div>

          {/* Email Notifications */}
          <div className="xl:col-span-1">
            <EmailNotifications />
          </div>

          {/* News Feed */}
          <div className="lg:col-span-1 xl:col-span-2">
            <NewsFeed />
          </div>

          {/* Watchlist */}
          <div className="lg:col-span-1 xl:col-span-1">
            <Watchlist />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
