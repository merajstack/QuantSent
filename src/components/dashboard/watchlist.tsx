import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Star, Bot, Trash2, RefreshCw, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();

  useImperativeHandle(ref, () => ({
    addStock
  }));

  const loadUserWatchlist = async () => {
    if (!user) return;
    
    try {
      const { data: userWatchlist, error } = await supabase
        .from('watchlist')
        .select('symbol')
        .eq('user_id', user.id);

      if (error) throw error;

      const symbols = userWatchlist?.map(item => item.symbol) || [];
      
      if (symbols.length === 0) {
        setWatchlist([]);
        return;
      }

      await fetchWatchlistData(symbols);
    } catch (err) {
      console.error("Failed to load user watchlist:", err);
    }
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
    if (user) {
      loadUserWatchlist();
    }
  }, [user]);

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
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('symbol', symbol);

      if (error) throw error;

      setWatchlist(prev => prev.filter(stock => stock.symbol !== symbol));
      toast({
        title: "Stock Removed",
        description: `${symbol} removed from watchlist`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove stock from watchlist",
        variant: "destructive",
      });
    }
  };

  const addStock = async (symbol: string) => {
    if (!user) return;
    
    try {
      // Check if stock already exists in database
      const { data: existingStock } = await supabase
        .from('watchlist')
        .select('symbol')
        .eq('user_id', user.id)
        .eq('symbol', symbol.toUpperCase())
        .single();

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

      // Add to database
      const { error: insertError } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          symbol: data.symbol
        });

      if (insertError) throw insertError;

      const newStock: WatchlistStock = {
        symbol: data.symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        sentiment: data.sentiment,
        notifications: true
      };

      setWatchlist(prev => [...prev, newStock]);
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
              onClick={loadUserWatchlist}
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