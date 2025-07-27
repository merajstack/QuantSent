import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FinancialRatios {
  peRatio: number | null;
  pegRatio: number | null;
  pbRatio: number | null;
  priceToSales: number | null;
  debtToEquity: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  profitMargin: number | null;
  operatingMargin: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  dividendYield: number | null;
  beta: number | null;
  eps: number | null;
  marketCap: number | null;
}

interface FinancialRatiosProps {
  ratios: FinancialRatios | null;
  symbol: string;
}

const formatRatio = (value: number | null, isPercentage = false, isCurrency = false) => {
  if (value === null || value === undefined) return "N/A";
  
  if (isCurrency && value > 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (isCurrency && value > 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (isPercentage) {
    return `${(value * 100).toFixed(2)}%`;
  } else {
    return value.toFixed(2);
  }
};

const getRatioColor = (value: number | null, type: string) => {
  if (value === null) return "secondary";
  
  switch (type) {
    case "pe":
      return value < 15 ? "default" : value < 25 ? "secondary" : "destructive";
    case "debt":
      return value < 0.3 ? "default" : value < 0.6 ? "secondary" : "destructive";
    case "roe":
    case "roa":
      return value > 0.15 ? "default" : value > 0.1 ? "secondary" : "destructive";
    case "margin":
      return value > 0.2 ? "default" : value > 0.1 ? "secondary" : "destructive";
    case "current":
      return value > 2 ? "default" : value > 1.5 ? "secondary" : "destructive";
    default:
      return "secondary";
  }
};

export function FinancialRatios({ ratios, symbol }: FinancialRatiosProps) {
  if (!ratios) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Financial ratios not available for {symbol}</p>
        </CardContent>
      </Card>
    );
  }

  const ratioGroups = [
    {
      title: "Valuation",
      ratios: [
        { label: "P/E Ratio", value: ratios.peRatio, type: "pe" },
        { label: "PEG Ratio", value: ratios.pegRatio, type: "default" },
        { label: "P/B Ratio", value: ratios.pbRatio, type: "default" },
        { label: "P/S Ratio", value: ratios.priceToSales, type: "default" },
      ]
    },
    {
      title: "Profitability",
      ratios: [
        { label: "ROE", value: ratios.returnOnEquity, type: "roe", isPercentage: true },
        { label: "ROA", value: ratios.returnOnAssets, type: "roa", isPercentage: true },
        { label: "Profit Margin", value: ratios.profitMargin, type: "margin", isPercentage: true },
        { label: "Operating Margin", value: ratios.operatingMargin, type: "margin", isPercentage: true },
      ]
    },
    {
      title: "Liquidity & Debt",
      ratios: [
        { label: "Current Ratio", value: ratios.currentRatio, type: "current" },
        { label: "Quick Ratio", value: ratios.quickRatio, type: "current" },
        { label: "Debt/Equity", value: ratios.debtToEquity, type: "debt" },
        { label: "Beta", value: ratios.beta, type: "default" },
      ]
    },
    {
      title: "Key Metrics",
      ratios: [
        { label: "EPS", value: ratios.eps, type: "default", isCurrency: true },
        { label: "Dividend Yield", value: ratios.dividendYield, type: "default", isPercentage: true },
        { label: "Market Cap", value: ratios.marketCap, type: "default", isCurrency: true },
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Ratios - {symbol}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {ratioGroups.map((group) => (
          <div key={group.title}>
            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">
              {group.title}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {group.ratios.map((ratio) => (
                <div key={ratio.label} className="flex justify-between items-center">
                  <span className="text-sm">{ratio.label}:</span>
                  <Badge variant={getRatioColor(ratio.value, ratio.type)}>
                    {formatRatio(ratio.value, ratio.isPercentage, ratio.isCurrency)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}