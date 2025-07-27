import { useState } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStockData } from "@/hooks/use-stock-data";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export function StockComparison() {
  const [stock1, setStock1] = useState("");
  const [stock2, setStock2] = useState("");
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCompare = async () => {
    if (!stock1.trim() || !stock2.trim()) {
      toast({
        title: "Error",
        description: "Please enter both stock symbols",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch both stocks
      const [response1, response2] = await Promise.all([
        fetch(`https://api.twelvedata.com/quote?symbol=${stock1.toUpperCase()}&apikey=855ede4efd3a442d86ba8c4befdf426c`),
        fetch(`https://api.twelvedata.com/quote?symbol=${stock2.toUpperCase()}&apikey=855ede4efd3a442d86ba8c4befdf426c`)
      ]);

      const [data1, data2] = await Promise.all([
        response1.json(),
        response2.json()
      ]);

      if (data1.status === 'error' || data2.status === 'error') {
        throw new Error(data1.message || data2.message || 'Invalid symbols');
      }

      // Create comparison data
      const comparison = {
        stock1: {
          symbol: data1.symbol,
          price: parseFloat(data1.close) || 0,
          change: parseFloat(data1.change) || 0,
          changePercent: parseFloat(data1.percent_change) || 0,
          volume: data1.volume,
          high: parseFloat(data1.high) || 0,
          low: parseFloat(data1.low) || 0,
        },
        stock2: {
          symbol: data2.symbol,
          price: parseFloat(data2.close) || 0,
          change: parseFloat(data2.change) || 0,
          changePercent: parseFloat(data2.percent_change) || 0,
          volume: data2.volume,
          high: parseFloat(data2.high) || 0,
          low: parseFloat(data2.low) || 0,
        }
      };

      setComparisonData(comparison);
      toast({
        title: "Comparison Ready",
        description: `Comparing ${stock1.toUpperCase()} vs ${stock2.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch comparison data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = comparisonData ? [
    {
      metric: "Price",
      [comparisonData.stock1.symbol]: comparisonData.stock1.price,
      [comparisonData.stock2.symbol]: comparisonData.stock2.price,
    },
    {
      metric: "High",
      [comparisonData.stock1.symbol]: comparisonData.stock1.high,
      [comparisonData.stock2.symbol]: comparisonData.stock2.high,
    },
    {
      metric: "Low",
      [comparisonData.stock1.symbol]: comparisonData.stock1.low,
      [comparisonData.stock2.symbol]: comparisonData.stock2.low,
    }
  ] : [];

  const chartConfig = comparisonData ? {
    [comparisonData.stock1.symbol]: {
      label: comparisonData.stock1.symbol,
      color: "hsl(var(--chart-1))",
    },
    [comparisonData.stock2.symbol]: {
      label: comparisonData.stock2.symbol,
      color: "hsl(var(--chart-2))",
    },
  } : {};

  return (
    <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart3 className="h-5 w-5 text-primary" />
          Stock Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="First stock (e.g., AAPL)"
            value={stock1}
            onChange={(e) => setStock1(e.target.value)}
          />
          <Input
            placeholder="Second stock (e.g., TSLA)"
            value={stock2}
            onChange={(e) => setStock2(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={handleCompare}
          disabled={loading || !stock1.trim() || !stock2.trim()}
          className="w-full bg-gradient-primary hover:scale-105 transition-all duration-200"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Compare Stocks"
          )}
        </Button>

        {comparisonData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-chart-1/10 rounded-lg border border-chart-1/20">
                <h3 className="font-bold text-lg">{comparisonData.stock1.symbol}</h3>
                <p className="text-2xl font-bold">${comparisonData.stock1.price.toFixed(2)}</p>
                <p className={`text-sm ${comparisonData.stock1.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparisonData.stock1.change >= 0 ? '+' : ''}{comparisonData.stock1.change.toFixed(2)} 
                  ({comparisonData.stock1.changePercent >= 0 ? '+' : ''}{comparisonData.stock1.changePercent.toFixed(2)}%)
                </p>
              </div>
              
              <div className="p-4 bg-chart-2/10 rounded-lg border border-chart-2/20">
                <h3 className="font-bold text-lg">{comparisonData.stock2.symbol}</h3>
                <p className="text-2xl font-bold">${comparisonData.stock2.price.toFixed(2)}</p>
                <p className={`text-sm ${comparisonData.stock2.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparisonData.stock2.change >= 0 ? '+' : ''}{comparisonData.stock2.change.toFixed(2)} 
                  ({comparisonData.stock2.changePercent >= 0 ? '+' : ''}{comparisonData.stock2.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>

            <ChartContainer config={chartConfig} className="min-h-[300px]">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey={comparisonData.stock1.symbol} 
                  stroke={`var(--color-${comparisonData.stock1.symbol})`}
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey={comparisonData.stock2.symbol} 
                  stroke={`var(--color-${comparisonData.stock2.symbol})`}
                  strokeWidth={2} 
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}