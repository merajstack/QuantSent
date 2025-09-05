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

    // Try to fetch financial ratios
    try {
      const fundamentalsResponse = await fetch(
        `https://api.twelvedata.com/statistics?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`
      );
      
      if (fundamentalsResponse.ok) {
        const fundamentalsData = await fundamentalsResponse.json();
        
        if (fundamentalsData.status !== 'error') {
          const stats = fundamentalsData.statistics || {};
          const valuations = stats.valuations || {};
          const financials = stats.financials || {};
          
          financialRatios = {
            peRatio: parseFloat(valuations.trailing_pe) || null,
            pegRatio: parseFloat(valuations.peg_ratio) || null,
            pbRatio: parseFloat(valuations.price_to_book) || null,
            priceToSales: parseFloat(valuations.price_to_sales) || null,
            debtToEquity: parseFloat(financials.debt_to_equity) || null,
            returnOnEquity: parseFloat(financials.return_on_equity) ? parseFloat(financials.return_on_equity) / 100 : null,
            returnOnAssets: parseFloat(financials.return_on_assets) ? parseFloat(financials.return_on_assets) / 100 : null,
            profitMargin: parseFloat(financials.profit_margin) ? parseFloat(financials.profit_margin) / 100 : null,
            operatingMargin: parseFloat(financials.operating_margin) ? parseFloat(financials.operating_margin) / 100 : null,
            currentRatio: parseFloat(financials.current_ratio) || null,
            quickRatio: parseFloat(financials.quick_ratio) || null,
            dividendYield: parseFloat(valuations.dividend_yield) ? parseFloat(valuations.dividend_yield) / 100 : null,
            beta: parseFloat(valuations.beta) || null,
            eps: parseFloat(financials.earnings_per_share) || null,
            marketCap: parseFloat(valuations.market_cap) || null,
          };
        }
      }
    } catch (error) {
      // Financial ratios are optional, continue without them
      console.warn('Failed to fetch financial ratios:', error);
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