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
    const { symbol } = await req.json()
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const apiKey = Deno.env.get('TWELVE_DATA_API_KEY') || '855ede4efd3a442d86ba8c4befdf426c'
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch real-time quote and fundamentals concurrently
    const [quoteResponse, fundamentalsResponse] = await Promise.all([
      fetch(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`),
      fetch(`https://api.twelvedata.com/fundamentals?symbol=${symbol}&apikey=${apiKey}`)
    ])
    
    if (!quoteResponse.ok) {
      throw new Error('Failed to fetch stock data')
    }

    const quoteData = await quoteResponse.json()
    
    if (quoteData.status === 'error') {
      return new Response(
        JSON.stringify({ error: quoteData.message || 'Invalid symbol' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse fundamentals data (may fail for some stocks)
    let fundamentalsData = null
    if (fundamentalsResponse.ok) {
      try {
        const fundamentals = await fundamentalsResponse.json()
        if (fundamentals.status !== 'error') {
          fundamentalsData = fundamentals
        }
      } catch (error) {
        console.log('Failed to parse fundamentals data:', error)
      }
    }

    // Calculate sentiment based on price change
    const change = parseFloat(quoteData.change) || 0
    const sentiment = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'

    // Extract financial ratios from fundamentals data
    const financialRatios = fundamentalsData ? {
      peRatio: fundamentalsData.valuation?.pe_ratio || null,
      pegRatio: fundamentalsData.valuation?.peg_ratio || null,
      pbRatio: fundamentalsData.valuation?.pb_ratio || null,
      priceToSales: fundamentalsData.valuation?.ps_ratio || null,
      debtToEquity: fundamentalsData.financials?.balance_sheet?.debt_to_equity || null,
      returnOnEquity: fundamentalsData.financials?.income_statement?.roe || null,
      returnOnAssets: fundamentalsData.financials?.income_statement?.roa || null,
      profitMargin: fundamentalsData.financials?.income_statement?.profit_margin || null,
      operatingMargin: fundamentalsData.financials?.income_statement?.operating_margin || null,
      currentRatio: fundamentalsData.financials?.balance_sheet?.current_ratio || null,
      quickRatio: fundamentalsData.financials?.balance_sheet?.quick_ratio || null,
      dividendYield: fundamentalsData.statistics?.dividend_yield || null,
      beta: fundamentalsData.statistics?.beta || null,
      eps: fundamentalsData.financials?.income_statement?.eps || null,
      marketCap: fundamentalsData.statistics?.market_capitalization || null
    } : null

    const stockData = {
      symbol: quoteData.symbol,
      price: parseFloat(quoteData.close) || 0,
      change: change,
      changePercent: parseFloat(quoteData.percent_change) || 0,
      lastUpdated: new Date().toLocaleString(),
      sentiment: sentiment,
      volume: quoteData.volume,
      high: parseFloat(quoteData.high) || 0,
      low: parseFloat(quoteData.low) || 0,
      open: parseFloat(quoteData.open) || 0,
      financialRatios: financialRatios
    }

    return new Response(
      JSON.stringify(stockData),
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