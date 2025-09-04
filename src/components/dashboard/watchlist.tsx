import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Star, Bot, Trash2, RefreshCw, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WatchlistStock {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  sentiment: "positive" | "negative" | "neutral";
  notifications: boolean;
  error?: string;
}

export const Watchlist = forwardRef<{ addStock: (symbol: string) => Promise<void> }>((props, ref) => {
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    addStock
  }));

  // Load watchlist from localStorage
  const loadWatchlist = () => {
    try {
      const saved = localStorage.getItem('stockWatchlist');
      if (saved) {
        const symbols = JSON.parse(saved);
        if (symbols.length > 0) {
          fetchWatchlistData(symbols);
        } else {
          setWatchlist([]);
        }
      } else {
        setWatchlist([]);
      }
    } catch (err) {
      console.error("Failed to load watchlist:", err);
      setWatchlist([]);
    }
  };

  // Save watchlist symbols to localStorage
  const saveWatchlistSymbols = (symbols: string[]) => {
    localStorage.setItem('stockWatchlist', JSON.stringify(symbols));
  };

  const fetchWatchlistData = async (symbols: string[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-watchlist-data', {
        body: { symbols }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch watchlist data');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setWatchlist(data.watchlist);
    } catch (err) {
      console.error("Failed to fetch watchlist data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const toggleNotifications = (symbol: string) => {
    setWatchlist(prev => prev.map(stock => 
      stock.symbol === symbol 
        ? { ...stock, notifications: !stock.notifications }
        : stock
    ));
    
    const stock = watchlist.find(s => s.symbol === symbol);
    toast({
      title: "Notifications Updated",
      description: `${symbol} notifications ${stock?.notifications ? 'disabled' : 'enabled'}`,
    });
  };

  const removeStock = (symbol: string) => {
    const updatedWatchlist = watchlist.filter(stock => stock.symbol !== symbol);
    setWatchlist(updatedWatchlist);
    
    // Update localStorage
    const symbols = updatedWatchlist.map(stock => stock.symbol);
    saveWatchlistSymbols(symbols);
    
    toast({
      title: "Stock Removed",
      description: `${symbol} removed from watchlist`,
    });
  };

  const addStock = async (symbol: string) => {
    try {
      // Check if stock already exists in watchlist
      const existingStock = watchlist.find(stock => 
        stock.symbol.toUpperCase() === symbol.toUpperCase()
      );

      if (existingStock) {
        toast({
          title: "Stock Already Added",
          description: `${symbol} is already in your watchlist`,
          variant: "destructive",
        });
        return;
      }

      // Fetch stock data to validate symbol
      const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
        body: { symbol: symbol.toUpperCase() }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch stock data');
      }

      if (data.error) {
        toast({
          title: "Invalid Stock Symbol",
          description: `${symbol} is not a valid stock symbol. Use the AI Assistant to get the correct symbol.`,
          variant: "destructive",
        });
        return;
      }

      const newStock: WatchlistStock = {
        symbol: data.symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        sentiment: data.sentiment,
        notifications: true
      };

      const updatedWatchlist = [...watchlist, newStock];
      setWatchlist(updatedWatchlist);
      
      // Update localStorage
      const symbols = updatedWatchlist.map(stock => stock.symbol);
      saveWatchlistSymbols(symbols);
      
      toast({
        title: "Stock Added",
        description: `${symbol} added to watchlist`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add stock";
      if (errorMessage.includes('not found') || errorMessage.includes('invalid')) {
        toast({
          title: "Invalid Stock Symbol",
          description: `${symbol} is not a valid stock symbol. Use the AI Assistant to get the correct symbol.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-finance-gold" />
            Watchlist
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2"
              onClick={loadWatchlist}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2"
              onClick={() => window.open('https://fin-bot-1-67ai.onrender.com/', '_blank')}
            >
              <span className="font-bold text-primary">AI</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {watchlist.map((stock, index) => (
            <div
              key={stock.symbol}
              className="p-3 border border-border rounded-lg hover:shadow-md transition-all duration-200 animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      ${stock.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      stock.change >= 0 ? 'text-finance-positive' : 'text-finance-negative'
                    }`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                    </div>
                    <div className={`text-xs ${
                      stock.changePercent >= 0 ? 'text-finance-positive' : 'text-finance-negative'
                    }`}>
                      ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <SentimentBadge sentiment={stock.sentiment} />
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStock(stock.symbol)}
                    className="p-1 h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {watchlist.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No stocks in your watchlist</p>
              <p className="text-sm">Add stocks to track their sentiment</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});