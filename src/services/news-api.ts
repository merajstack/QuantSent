interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: "positive" | "negative" | "neutral";
}

// Mock API key - in a real app, this would be from environment variables
const NEWS_API_KEY = 'demo'; // Using demo key for now

export async function fetchStockNews(symbol?: string, category: string = 'business'): Promise<NewsArticle[]> {
  try {
    // Construct query based on whether we have a specific symbol
    const query = symbol ? `${symbol} stock` : 'stock market';
    
    // Using News API
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`
    );
    
    if (!response.ok) {
      // If News API fails, return mock data
      return getMockNews(symbol);
    }
    
    const data = await response.json();
    
    if (data.status === 'error' || !data.articles) {
      return getMockNews(symbol);
    }
    
    return data.articles.map((article: any, index: number) => ({
      id: `${article.url}-${index}`,
      title: article.title || 'No title available',
      description: article.description || 'No description available',
      url: article.url,
      source: article.source?.name || 'Unknown Source',
      publishedAt: article.publishedAt || new Date().toISOString(),
      sentiment: generateMockSentiment(), // Mock sentiment analysis
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return getMockNews(symbol);
  }
}

function getMockNews(symbol?: string): NewsArticle[] {
  const baseNews = [
    {
      id: '1',
      title: symbol ? `${symbol} Stock Shows Strong Performance` : 'Stock Market Opens Higher',
      description: symbol ? `Analysis shows ${symbol} continues to attract investor interest.` : 'Major indices show positive momentum in early trading.',
      url: '#',
      source: 'Financial Times',
      publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      sentiment: 'positive' as const,
    },
    {
      id: '2',
      title: symbol ? `${symbol} Quarterly Earnings Preview` : 'Market Volatility Expected This Week',
      description: symbol ? `Investors await ${symbol} earnings report scheduled for next week.` : 'Economic indicators suggest potential market fluctuations.',
      url: '#',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      sentiment: 'neutral' as const,
    },
    {
      id: '3',
      title: symbol ? `Analysts Update ${symbol} Price Targets` : 'Tech Stocks Rally Continues',
      description: symbol ? `Several major investment firms have revised their ${symbol} price targets.` : 'Technology sector leads market gains for the third consecutive day.',
      url: '#',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      sentiment: 'positive' as const,
    },
    {
      id: '4',
      title: symbol ? `${symbol} Trading Volume Increases` : 'Federal Reserve Meeting This Week',
      description: symbol ? `${symbol} sees increased trading activity amid market speculation.` : 'Investors prepare for potential policy changes following Fed meeting.',
      url: '#',
      source: 'MarketWatch',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      sentiment: 'neutral' as const,
    },
    {
      id: '5',
      title: symbol ? `${symbol} Stock Analysis Report` : 'Global Markets Mixed',
      description: symbol ? `Comprehensive analysis of ${symbol} fundamentals and technical indicators.` : 'International markets show mixed performance amid economic uncertainty.',
      url: '#',
      source: 'CNBC',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
      sentiment: 'neutral' as const,
    },
  ];

  return baseNews;
}

function generateMockSentiment(): "positive" | "negative" | "neutral" {
  const sentiments = ['positive', 'negative', 'neutral'] as const;
  return sentiments[Math.floor(Math.random() * sentiments.length)];
}