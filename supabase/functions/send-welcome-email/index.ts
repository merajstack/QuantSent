import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();
    
    console.log(`Sending welcome email to: ${email}`);

    const mailerSendApiKey = Deno.env.get('MAILERSEND_API_KEY');
    if (!mailerSendApiKey) {
      throw new Error('MAILERSEND_API_KEY is not configured');
    }

    // Prepare the email data for MailerSend
    const emailData = {
      from: {
        email: "noreply@trial-3zxk54v90n7gjy6v.mlsender.net",
        name: "QuantSent Team"
      },
      to: [{
        email: email,
        name: name || "New User"
      }],
      subject: "Welcome to QuantSent! 🚀",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to QuantSent</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Welcome to QuantSent!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your journey to smarter investing starts here</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Hi ${name || 'there'}! 👋</h2>
            <p style="margin-bottom: 20px;">Thank you for joining QuantSent! We're excited to have you on board.</p>
            
            <h3 style="color: #667eea; margin-bottom: 15px;">🎯 What you can do now:</h3>
            <ul style="margin-bottom: 20px; padding-left: 20px;">
              <li style="margin-bottom: 10px;"><strong>Track Your Stocks:</strong> Add stocks to your watchlist and monitor real-time sentiment</li>
              <li style="margin-bottom: 10px;"><strong>AI-Powered Insights:</strong> Get intelligent market analysis with our AI chatbot</li>
              <li style="margin-bottom: 10px;"><strong>Stay Updated:</strong> Receive personalized news and alerts</li>
              <li style="margin-bottom: 10px;"><strong>Compare Performance:</strong> Use our tools to compare different stocks</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://uqrvfaapujzrkkpjncml.supabase.co', window.location?.origin || 'https://your-app-url.com')}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Start Exploring QuantSent →
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
            <p>Need help? Reply to this email or contact our support team.</p>
            <p style="margin: 5px 0;">© 2024 QuantSent. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to QuantSent!
        
        Hi ${name || 'there'}!
        
        Thank you for joining QuantSent! We're excited to have you on board.
        
        What you can do now:
        • Track Your Stocks: Add stocks to your watchlist and monitor real-time sentiment
        • AI-Powered Insights: Get intelligent market analysis with our AI chatbot  
        • Stay Updated: Receive personalized news and alerts
        • Compare Performance: Use our tools to compare different stocks
        
        Start exploring: ${window.location?.origin || 'https://your-app-url.com'}
        
        Need help? Reply to this email or contact our support team.
        
        © 2024 QuantSent. All rights reserved.
      `
    };

    // Send email using MailerSend API
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailerSendApiKey}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MailerSend API error:', response.status, errorText);
      throw new Error(`MailerSend API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Welcome email sent successfully:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully',
        result 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in send-welcome-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);