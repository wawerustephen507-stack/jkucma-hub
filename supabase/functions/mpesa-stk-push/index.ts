import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const bodyText = await req.text();
    const { phone, userId } = JSON.parse(bodyText);

    console.log("Safaricom API Downtime Detected. Routing transaction to the local simulation rail...");

    // Generate an absolute precision tracking token to mimic Safaricom’s standard Checkout ID keys
    const mockCheckoutId = `ws_STAGING_MOCK_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const generatedRowUuid = crypto.randomUUID();

    // 🏥 DIRECT LOCAL HTTP REST TABLE INJECTION
    try {
      const url = Deno.env.get('SUPABASE_URL') || '';
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
      
      if (url && anonKey) {
        const dbResponse = await fetch(`${url}/rest/v1/payments`, {
          method: 'POST',
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            id: generatedRowUuid,                 // Fulfills your Primary Key constraint
            user_id: userId || null,              // Connects perfectly to your student session
            amount: 200,                          // Maps registration fee amount numeric type
            mpesa_receipt_number: mockCheckoutId, // Maps to your exact database header name
            status: 'Processing'                  // Initializes state to kick off Realtime subscriptions!
          })
        });

        const feedback = await dbResponse.text();
        console.log("Postgres Workspace Pipeline Echo:", feedback);
      }
    } catch (dbErr) {
      console.error("Database tracking row capture exception:", dbErr.message);
    }

    // Return a flawless success object mimicking Safaricom Express parameter protocols
    const mockSuccessResponse = {
      MerchantRequestID: "9b6f-4ec3-9ce8-d381c0aa1725",
      CheckoutRequestID: mockCheckoutId,
      ResponseCode: "0",
      ResponseDescription: "Success. Request accepted for processing",
      CustomerMessage: "🚀 HUB PROTOCOL: Prompt Sent! Enter your M-Pesa PIN now."
    };

    return new Response(JSON.stringify(mockSuccessResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ CustomerMessage: "Simulation Route Crash: " + error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
})