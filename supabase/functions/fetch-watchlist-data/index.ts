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
    const { symbols } = await req.json()
    
    if (!symbols || !Array.isArray(symbols)) {
      return new Response(
        JSON.stringify({ error: 'Symbols array is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const apiKey = Deno.env.get('TWELVE_DATA_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch data for all symbols
    const promises = symbols.map(async (symbol: string) => {
      try {
        const response = await fetch(
          `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`
        )
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${symbol}`)
        }

        const data = await response.json()
        
        if (data.status === 'error') {
          throw new Error(data.message || `Invalid symbol: ${symbol}`)
        }

        const change = parseFloat(data.change) || 0
        const sentiment = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'

        return {
          symbol: data.symbol,
          price: parseFloat(data.close) || 0,
          change: change,
          changePercent: parseFloat(data.percent_change) || 0,
          sentiment: sentiment,
          notifications: true // Default to true, will be managed by frontend
        }
      } catch (error) {
        // Return error data for failed symbols
        return {
          symbol: symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          sentiment: 'neutral' as const,
          notifications: true,
          error: error.message
        }
      }
    })

    const results = await Promise.all(promises)

    return new Response(
      JSON.stringify({ watchlist: results }),
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