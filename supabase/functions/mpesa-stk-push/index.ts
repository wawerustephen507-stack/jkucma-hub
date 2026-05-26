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
    
    // Generate a unique fallback string reference for the staging tracker
    const mockTrackingId = `ws_MOCK_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // 🏥 FIX: Generate a valid v4 UUID client-side to satisfy the database Primary Key constraint
    const generatedRowUuid = crypto.randomUUID();

    // EXACT COLUMN MATCHING INJECTION
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
            id: generatedRowUuid,                 // 🏥 FIXED: Explicitly passes the required primary key UUID!
            user_id: userId || null,              // Matches user_id column
            amount: 1,                            // Matches amount column
            mpesa_receipt_number: mockTrackingId, // Matches your exact table schema header name
            status: 'Processing'                  // Matches status column
          })
        });

        const dbResultText = await dbResponse.text();
        console.log("Database Engine Handshake Feedback:", dbResultText);
      }
    } catch (dbErr) {
      console.error("Isolated database write catch log:", dbErr.message);
    }

    // Standard mock format mimicking Safaricom parameters
    const mockSuccessResponse = {
      MerchantRequestID: "9b6f-4ec3-9ce8-d381c0aa1725",
      CheckoutRequestID: mockTrackingId,
      ResponseCode: "0",
      ResponseDescription: "Success. Request accepted for processing",
      CustomerMessage: "HUB PROTOCOL: Prompt Sent! Enter your M-Pesa PIN now."
    };

    return new Response(JSON.stringify(mockSuccessResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ CustomerMessage: "Tunnel Execution Error: " + error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
})