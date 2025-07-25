import { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  currentPrice?: number;
}

export function StockSearch({ onSearch, currentPrice }: StockSearchProps) {
  const [symbol, setSymbol] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!symbol.trim()) return;
    
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
    onSearch(symbol.toUpperCase());
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="h-5 w-5 text-primary" />
          Stock Search
        </CardTitle>
        <CardDescription>
          Search for any stock symbol (e.g., AAPL, TSLA, MSFT)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter stock symbol..."
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-lg border-2 focus:border-primary transition-colors"
          />
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !symbol.trim()}
            className="bg-gradient-primary hover:scale-105 transition-all duration-200 shadow-finance"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {currentPrice && (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-sm text-muted-foreground">Live Price Preview</div>
            <div className="text-2xl font-bold text-primary animate-pulse-glow">
              ${currentPrice.toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}