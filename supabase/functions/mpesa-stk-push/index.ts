import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // 🏥 Clear browser handshake blocks
}

serve(async (req) => {
  // 🏥 1. Handle CORS Preflight (The browser's "handshake")
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const bodyText = await req.text();
    const { phone, amount } = JSON.parse(bodyText);
    
    // 🏥 SECRETS: Pulled directly from your Supabase Environment Configuration
    const consumerKey = Deno.env.get('DARAJA_CONSUMER_KEY')?.trim()
    const consumerSecret = Deno.env.get('DARAJA_CONSUMER_SECRET')?.trim()
    const passkey = Deno.env.get('DARAJA_PASSKEY')?.trim()
    
    // 🏥 FIX: Dynamically fetching your custom shortcode out of your Dashboard Secrets list
    const shortcode = Deno.env.get('DARAJA_SHORTCODE')?.trim() || "174379"

    // 🏥 2. GET ACCESS TOKEN
    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    const tokenRes = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` }
    })
    
    if (!tokenRes.ok) {
      return new Response(JSON.stringify({ CustomerMessage: "Daraja Auth Failed. Check your Secrets in Supabase." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      })
    }

    const { access_token } = await tokenRes.json()

    // 🏥 3. GENERATE STK TIMESTAMP
    const now = new Date();
    const timestamp = 
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');

    const password = btoa(shortcode + passkey + timestamp)

    // 🏥 4. THE PUSH REQUEST
    const res = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${access_token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: 1, // 🏥 FORCE 1 SHILLING FOR SANDBOX SUCCESS
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: "https://ijqvkeqgfpfeeyprhqwe.supabase.co/functions/v1/mpesa-callback",
        AccountReference: "JKUCMA HUB",
        TransactionDesc: "Registration Fee"
      })
    })

    const result = await res.json()
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ CustomerMessage: "System Error: " + error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }
})