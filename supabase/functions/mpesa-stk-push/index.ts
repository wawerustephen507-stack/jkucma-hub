import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Custom native web-safe encoding helper to completely bypass node dependency crashes
const encodeBase64 = (str: string) => {
  const bytes = new TextEncoder().encode(str);
  const binString = String.fromCharCode(...bytes);
  return btoa(binString);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const bodyText = await req.text();
    const { phone, userId } = JSON.parse(bodyText);
    
    // Clean and normalize Kenyan phone strings back to standard 254 formatting
    let formattedPhone = phone.replace(/[\s+-]/g, ''); 
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1); 
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '254' + formattedPhone; 
    }

    const consumerKey = "jzSjMIfajatx43AfUJZIDS5CiJp3BgaXLfW12HquMFNATp8s";
    const consumerSecret = "OMjSIZ8XSZuGALdvTVmIkFf2Ou0gxNzOCxbIhYi3L6V5hQzcs4LiVmzQeZ5GOtzI";
    const shortcode = "174379";
    const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

    // Generate credentials signature cleanly
    const authCredentials = encodeBase64(`${consumerKey.trim()}:${consumerSecret.trim()}`);
    
    // 🏥 STEP 1: REQUEST FRESH LIVE DYNAMIC OAUTH ACCESS TOKEN
    const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      method: "GET",
      headers: {
        "Authorization": `Basic ${authCredentials}`,
        "Content-Type": "application/json"
      }
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return new Response(JSON.stringify({ CustomerMessage: `Safaricom Auth Server Rejection: ${errorText}` }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      });
    }

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    // Generate absolute precision timestamp formatting
    const now = new Date();
    const timestamp = 
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');

    const password = encodeBase64(shortcode + passkey + timestamp);

    // 🏥 STEP 2: TRIGGER ACTUAL SAFARICOM M-PESA STK POPUP DETONATOR
    const res = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${access_token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: 1, 
        PartyA: formattedPhone, 
        PartyB: shortcode,
        PhoneNumber: formattedPhone, 
        CallBackURL: "https://ijqvkeqgfpfeeyprhqwe.supabase.co/functions/v1/mpesa-callback",
        AccountReference: "JKUCMA HUB",
        TransactionDesc: "Registration Fee"
      })
    });

    const result = await res.json();

    // 🏥 STEP 3: LOG REALTIME TRACKING RECORDS INTENT IF HANDSHAKE SIGNED SUCCESSFULLY
    if (result.ResponseCode === "0" || result.ResponseCode === 0) {
      try {
        const url = Deno.env.get('SUPABASE_URL') || '';
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
        const generatedRowUuid = crypto.randomUUID();
        
        if (url && anonKey) {
          await fetch(`${url}/rest/v1/payments`, {
            method: 'POST',
            headers: {
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              id: generatedRowUuid,
              user_id: userId || null,
              amount: 1,
              mpesa_receipt_number: result.CheckoutRequestID, // Stores checkout tracking reference key maps
              status: 'Processing'
            })
          });
        }
      } catch (dbErr) {
        console.error("Direct payment sync capture catch isolated:", dbErr.message);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ CustomerMessage: "Tunnel Execution Error: " + error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
})