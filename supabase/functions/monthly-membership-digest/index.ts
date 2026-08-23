import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Calculate Date Range (Past 30 Days)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    // 2. Fetch Membership Stats
    const { count: totalActive } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("membership_status", "Active");

    const { count: newRegistrations } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth);

    // 3. Fetch Payments & Revenue in the last month
    const { data: payments } = await supabase
      .from("payments")
      .select("amount, created_at, status")
      .eq("status", "Completed")
      .gte("created_at", startOfMonth);

    const totalRevenue = (payments || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    // 4. Fetch Members Expiring in the Next 30 Days
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: expiringMembers } = await supabase
      .from("profiles")
      .select("full_name, reg_number, membership_expires_at")
      .eq("membership_status", "Active")
      .lte("membership_expires_at", in30Days)
      .limit(10);

    const expiringRows = (expiringMembers || []).map(m => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 12px;">${m.full_name}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 12px;">${m.reg_number || 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 12px; color: #d97706;">
          ${new Date(m.membership_expires_at).toLocaleDateString('en-GB')}
        </td>
      </tr>
    `).join("") || "<tr><td colspan='3' style='padding: 8px; text-align: center; color: #94a3b8;'>No memberships expiring soon</td></tr>";

    // 5. Dynamic Recipient Lookup (Body -> DB Treasurer Role -> Fallback Email)
    const body = await req.json().catch(() => ({}));
    
    const { data: treasurer } = await supabase
      .from("profiles")
      .select("email")
      .eq("role", "Treasurer")
      .limit(1)
      .maybeSingle();

    const recipient = body.recipient || treasurer?.email || "wawerustephen507@gmail.com";

    // 6. Send Digest Email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "JKUCMA Digital Hub <onboarding@resend.dev>",
        to: [recipient],
        subject: `JKUCMA Treasury Report — ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background-color: #003366; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
              <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">JKUCMA Monthly Treasury & Membership Digest</h2>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">Automated financial audit and membership status report</p>
            </div>

            <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; background-color: #ffffff;">
              <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-top: 0;">Financial & Enrolment Metrics</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                <div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">Monthly Revenue</p>
                  <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: bold; color: #15803d;">KES ${totalRevenue.toLocaleString()}</p>
                </div>
                <div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">Total Active Members</p>
                  <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: bold; color: #003366;">${totalActive || 0}</p>
                </div>
              </div>

              <p style="font-size: 12px; color: #475569;">
                <strong>New Member Signups (Last 30 Days):</strong> ${newRegistrations || 0}
              </p>

              <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-top: 25px; margin-bottom: 8px;">
                Memberships Expiring in the Next 30 Days
              </h3>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;">
                <thead>
                  <tr style="background-color: #f1f5f9; text-align: left;">
                    <th style="padding: 8px; border: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase;">Member Name</th>
                    <th style="padding: 8px; border: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase;">Reg Number</th>
                    <th style="padding: 8px; border: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase;">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${expiringRows}
                </tbody>
              </table>
            </div>

            <div style="padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center; font-size: 10px; color: #94a3b8;">
              © 2026 JKUCMA Association • Automated System Dispatch
            </div>
          </div>
        `,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(JSON.stringify({ error: resendData }), {
        status: resendResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, revenue: totalRevenue, activeCount: totalActive, recipient, resendData }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});