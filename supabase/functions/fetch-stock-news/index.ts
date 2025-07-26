import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol, category = 'business' } = await req.json()
    
    const newsApiKey = Deno.env.get('NEWS_API_KEY')
    if (!newsApiKey) {
      return new Response(
        JSON.stringify({ error: 'News API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let url = `https://newsapi.org/v2/top-headlines?apiKey=${newsApiKey}&category=${category}&pageSize=10`
    
    // If symbol is provided, search for news about that specific stock
    if (symbol) {
      url = `https://newsapi.org/v2/everything?q=${symbol}&sortBy=publishedAt&apiKey=${newsApiKey}&pageSize=10`
    }

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch news')
    }

    const newsData = await response.json()
    
    if (newsData.status === 'error') {
      return new Response(
        JSON.stringify({ error: newsData.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Process articles and add sentiment analysis
    const articles = newsData.articles.map((article: any, index: number) => {
      // Simple sentiment analysis based on keywords
      const title = article.title?.toLowerCase() || ''
      const description = article.description?.toLowerCase() || ''
      const content = `${title} ${description}`
      
      let sentiment = 'neutral'
      
      const positiveWords = ['surge', 'growth', 'gains', 'up', 'rise', 'rally', 'boost', 'positive', 'strong', 'bullish']
      const negativeWords = ['fall', 'drop', 'decline', 'down', 'plunge', 'crash', 'negative', 'weak', 'bearish', 'loss']
      
      const positiveCount = positiveWords.filter(word => content.includes(word)).length
      const negativeCount = negativeWords.filter(word => content.includes(word)).length
      
      if (positiveCount > negativeCount) {
        sentiment = 'positive'
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative'
      }

      return {
        id: `${index}`,
        title: article.title,
        source: article.source?.name || 'Unknown',
        url: article.url,
        publishedAt: new Date(article.publishedAt).toLocaleString(),
        sentiment: sentiment as 'positive' | 'negative' | 'neutral',
        description: article.description,
        urlToImage: article.urlToImage
      }
    }).filter((article: any) => article.title && article.title !== '[Removed]')

    return new Response(
      JSON.stringify({ articles }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})