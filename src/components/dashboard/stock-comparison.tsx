import { useState } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStockData } from "@/hooks/use-stock-data";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

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
      // Fetch both stocks using Supabase edge function
      const [{ data: data1, error: error1 }, { data: data2, error: error2 }] = await Promise.all([
        supabase.functions.invoke('fetch-stock-data', {
          body: { symbol: stock1.toUpperCase() }
        }),
        supabase.functions.invoke('fetch-stock-data', {
          body: { symbol: stock2.toUpperCase() }
        })
      ]);

      if (error1 || error2) {
        throw new Error(error1?.message || error2?.message || 'Failed to fetch stock data');
      }

      if (data1.error || data2.error) {
        throw new Error(data1.error || data2.error);
      }

      // Create comparison data
      const comparison = {
        stock1: {
          symbol: data1.symbol,
          price: data1.price,
          change: data1.change,
          changePercent: data1.changePercent,
          volume: data1.volume,
          high: data1.high,
          low: data1.low,
          financialRatios: data1.financialRatios,
        },
        stock2: {
          symbol: data2.symbol,
          price: data2.price,
          change: data2.change,
          changePercent: data2.changePercent,
          volume: data2.volume,
          high: data2.high,
          low: data2.low,
          financialRatios: data2.financialRatios,
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

            {/* Financial Ratios Comparison */}
            {(comparisonData.stock1.financialRatios || comparisonData.stock2.financialRatios) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Financial Ratios Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "P/E Ratio", key: "peRatio" },
                    { label: "P/B Ratio", key: "pbRatio" },
                    { label: "ROE", key: "returnOnEquity", isPercentage: true },
                    { label: "ROA", key: "returnOnAssets", isPercentage: true },
                    { label: "Debt/Equity", key: "debtToEquity" },
                    { label: "Current Ratio", key: "currentRatio" },
                  ].map((ratio) => (
                    <div key={ratio.key} className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm font-medium mb-2">{ratio.label}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">{comparisonData.stock1.symbol}</div>
                          <Badge variant="outline" className="mt-1">
                            {comparisonData.stock1.financialRatios?.[ratio.key] !== null 
                              ? ratio.isPercentage 
                                ? `${(comparisonData.stock1.financialRatios?.[ratio.key] * 100).toFixed(2)}%`
                                : comparisonData.stock1.financialRatios?.[ratio.key]?.toFixed(2)
                              : "N/A"
                            }
                          </Badge>
                        </div>
                        <div className="text-vs text-muted-foreground">vs</div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">{comparisonData.stock2.symbol}</div>
                          <Badge variant="outline" className="mt-1">
                            {comparisonData.stock2.financialRatios?.[ratio.key] !== null 
                              ? ratio.isPercentage 
                                ? `${(comparisonData.stock2.financialRatios?.[ratio.key] * 100).toFixed(2)}%`
                                : comparisonData.stock2.financialRatios?.[ratio.key]?.toFixed(2)
                              : "N/A"
                            }
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}