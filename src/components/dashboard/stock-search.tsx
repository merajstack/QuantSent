import { useState, useEffect } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  currentPrice?: number;
  stockData?: any;
}

export function StockSearch({ onSearch, currentPrice, stockData }: StockSearchProps) {
  const [symbol, setSymbol] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (stockData) {
      // Generate mock historical data for visualization
      const mockData = [];
      const basePrice = stockData.price;
      for (let i = 6; i >= 0; i--) {
        const variation = (Math.random() - 0.5) * 0.1;
        mockData.push({
          time: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
          price: basePrice * (1 + variation)
        });
      }
      setChartData(mockData);
    }
  }, [stockData]);

  const handleSearch = async () => {
    if (!symbol.trim()) return;
    
    setIsSearching(true);
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

        {stockData && chartData.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Price Chart (7 Days)</h3>
            <ChartContainer 
              config={{
                price: {
                  label: "Price",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[200px]"
            >
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="var(--color-price)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-price)" }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}