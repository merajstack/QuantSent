import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentimentBadge } from "@/components/ui/sentiment-badge";

interface StockInfo {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  sentiment: "positive" | "negative" | "neutral";
}

interface StockInfoCardProps {
  stock?: StockInfo;
  loading?: boolean;
  error?: string;
}

export function StockInfoCard({ stock, loading, error }: StockInfoCardProps) {
  if (loading) {
    return (
      <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading stock data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center text-destructive">
            <p>Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stock) {
    return (
      <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30">
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Search for a stock to view information</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/30 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-2xl font-bold">{stock.symbol}</span>
          <SentimentBadge sentiment={stock.sentiment} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            ${stock.price.toFixed(2)}
          </div>
          <div className={`flex items-center justify-center gap-1 text-lg ${
            isPositive ? 'text-finance-positive' : 'text-finance-negative'
          }`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{isPositive ? '+' : ''}{stock.change.toFixed(2)}</span>
            <span>({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {stock.lastUpdated}</span>
          </div>
        </div>

        {/* Mini sparkline placeholder */}
        <div className="h-16 bg-muted/50 rounded-lg flex items-center justify-center">
          <div className="flex items-end gap-1 h-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-2 bg-gradient-primary rounded-sm animate-fade-in"
                style={{
                  height: `${Math.random() * 100 + 20}%`,
                  animationDelay: `${i * 50}ms`
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}