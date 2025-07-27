import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  sentiment: "positive" | "negative" | "neutral";
}

interface StockApiResponse {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  // Add other API response fields as needed
}

export function useStockData() {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStock = async (symbol: string) => {
    setLoading(true);
    setError(null);

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

      setStockData(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error occurred";
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    stockData,
    loading,
    error,
    fetchStock
  };
}