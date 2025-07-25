import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

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
      // TODO: Replace with your actual API endpoint
      // const response = await axios.get<StockApiResponse>(`/api/stocks/${symbol}`);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API response
      const mockData: StockData = {
        symbol: symbol.toUpperCase(),
        price: Math.random() * 1000 + 50,
        change: (Math.random() - 0.5) * 20,
        changePercent: (Math.random() - 0.5) * 10,
        lastUpdated: new Date().toLocaleString(),
        sentiment: Math.random() > 0.5 ? "positive" : Math.random() > 0.3 ? "negative" : "neutral"
      };

      setStockData(mockData);
      
      toast({
        title: "Stock Data Updated",
        description: `Fetched latest data for ${symbol}`,
      });

    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || "Failed to fetch stock data"
        : "Network error occurred";
      
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