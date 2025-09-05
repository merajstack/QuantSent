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

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  lastUpdated: string;
  sentiment: "positive" | "negative" | "neutral";
  financialRatios?: FinancialRatios | null;
}

// Twelve Data API key
const TWELVE_DATA_API_KEY = '855ede4efd3a442d86ba8c4befdf426c';

export async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    // Fetch basic quote data
    const quoteResponse = await fetch(
      `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`
    );
    
    if (!quoteResponse.ok) {
      throw new Error('Failed to fetch stock data');
    }
    
    const quoteData = await quoteResponse.json();
    
    if (quoteData.status === 'error' || quoteData.code === 400) {
      // Show the actual API error message instead of generic "invalid symbol"
      throw new Error(quoteData.message || `Failed to fetch data for ${symbol}`);
    }

    // Calculate change and change percent
    const price = parseFloat(quoteData.close || quoteData.price || '0');
    const previousClose = parseFloat(quoteData.previous_close || price.toString());
    const change = price - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    // Mock sentiment analysis (in a real app, this would use actual sentiment analysis)
    const sentiment = changePercent > 1 ? 'positive' : changePercent < -1 ? 'negative' : 'neutral';

    let financialRatios: FinancialRatios | null = null;

    // Try to fetch valuation ratios using /metrics endpoint
    try {
      const metricsResponse = await fetch(
        `https://api.twelvedata.com/metrics?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`
      );
      
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        
        if (metricsData.status !== 'error') {
          financialRatios = {
            peRatio: parseFloat(metricsData.pe_ratio) || null,
            pegRatio: null, // Not available in metrics endpoint
            pbRatio: parseFloat(metricsData.pb_ratio) || null,
            priceToSales: null, // Not available in metrics endpoint
            debtToEquity: parseFloat(metricsData.debt_to_equity) || null,
            returnOnEquity: null, // Not available in metrics endpoint
            returnOnAssets: null, // Not available in metrics endpoint
            profitMargin: null, // Not available in metrics endpoint
            operatingMargin: null, // Not available in metrics endpoint
            currentRatio: null, // Not available in metrics endpoint
            quickRatio: null, // Not available in metrics endpoint
            dividendYield: parseFloat(metricsData.dividend_yield) ? parseFloat(metricsData.dividend_yield) / 100 : null,
            beta: null, // Not available in metrics endpoint
            eps: null, // Not available in metrics endpoint
            marketCap: null, // Not available in metrics endpoint
          };
        }
      }
    } catch (error) {
      // Financial ratios are optional, continue without them
      console.warn('Failed to fetch valuation ratios:', error);
    }

    return {
      symbol: quoteData.symbol || symbol.toUpperCase(),
      price,
      change,
      changePercent,
      high: parseFloat(quoteData.high || quoteData.day_high || price.toString()),
      low: parseFloat(quoteData.low || quoteData.day_low || price.toString()),
      volume: parseInt(quoteData.volume || '0'),
      lastUpdated: new Date().toISOString(),
      sentiment,
      financialRatios,
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
}

export async function fetchMultipleStocks(symbols: string[]): Promise<StockData[]> {
  const promises = symbols.map(symbol => fetchStockData(symbol));
  const results = await Promise.allSettled(promises);
  
  return results
    .filter((result): result is PromiseFulfilledResult<StockData> => result.status === 'fulfilled')
    .map(result => result.value);
}