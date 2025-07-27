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

const defaultSymbols = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN"];

export const Watchlist = forwardRef<{ addStock: (symbol: string) => Promise<void> }>((props, ref) => {
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    addStock
  }));

  const fetchWatchlistData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-watchlist-data', {
        body: { symbols: defaultSymbols }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch watchlist data');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setWatchlist(data.watchlist);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch watchlist data";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlistData();
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

  const removeStock = async (symbol: string) => {
    setWatchlist(prev => prev.filter(stock => stock.symbol !== symbol));
    toast({
      title: "Stock Removed",
      description: `${symbol} removed from watchlist`,
    });
  };

  const addStock = async (symbol: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
        body: { symbol: symbol.toUpperCase() }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch stock data');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const newStock: WatchlistStock = {
        symbol: data.symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        sentiment: data.sentiment,
        notifications: true
      };

      setWatchlist(prev => {
        // Check if stock already exists
        if (prev.some(stock => stock.symbol === newStock.symbol)) {
          toast({
            title: "Stock Already Added",
            description: `${symbol} is already in your watchlist`,
            variant: "destructive",
          });
          return prev;
        }
        
        toast({
          title: "Stock Added",
          description: `${symbol} added to watchlist`,
        });
        return [...prev, newStock];
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add stock";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
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
              onClick={fetchWatchlistData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2"
              onClick={() => window.open('https://fin-bot-pv8q.onrender.com/', '_blank')}
            >
              <Bot className="h-4 w-4" />
              AI Bot
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