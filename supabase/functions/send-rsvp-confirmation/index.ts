/**
 * Supabase Edge Function: send-rsvp-confirmation
 *
 * Setup:
 *   supabase secrets set RESEND_API_KEY=re_xxxx
 *   supabase functions deploy send-rsvp-confirmation
 *
 * Photo is embedded inline as base64 — no hosting required.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_ADDRESS = "Jack & Katerina <noreply@jackandkat.love>";

const WEDDING_DATE = "Saturday, September 19th, 2026";
const VENUE = "Hotel Lilien";
const COCKTAIL_TIME = "4 PM";
const RSVP_DEADLINE = "August 1st";
const WEBSITE = "https://jackandkat.love/";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  email: string;
  partyName: string;
  attendingCount: number;
  maxGuests: number;
  dietaryNotes?: string | null;
  notes?: string | null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const { email, partyName, attendingCount, maxGuests, dietaryNotes, notes } =
    (await req.json()) as RequestBody;

  if (!email) return json({ error: "email is required" }, 400);

  const isAttending = attendingCount > 0;

  const attendingMessage = isAttending
    ? `We're so excited to celebrate with you — <strong>${attendingCount} of ${maxGuests}</strong> from your party will be joining us.`
    : `We're so sorry you won't be able to make it, but we hope to celebrate with you another time soon.`;

  const detailsBlock = isAttending ? `
    <tr>
      <td style="padding: 0 0 28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#faf9f7; border-left:3px solid #c9b99e; padding:16px 20px; font-family:'Georgia',serif; font-size:15px; color:#4a3f35; line-height:1.7;">
              Join us at <strong>${VENUE}</strong> on <strong>${WEDDING_DATE}</strong>.<br>
              Welcome cocktails begin at <strong>${COCKTAIL_TIME}</strong> before the ceremony.<br>
              Visit our <a href="${WEBSITE}" style="color:#8c7059; text-decoration:underline;">website</a> for schedule, accommodations &amp; more.
              ${dietaryNotes ? `<br><br><em>Dietary notes received: ${dietaryNotes}</em>` : ""}
              ${notes ? `<br><em>Your note to us: ${notes}</em>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>` : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your RSVP — Jack &amp; Katerina</title>
</head>
<body style="margin:0;padding:0;background:#f0ece6;font-family:'Georgia',serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece6;padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="560" cellpadding="0" cellspacing="0"
               style="max-width:560px;width:100%;background:#fff;border:1px solid #ddd5c8;border-radius:2px;">
          <tr>

            <!-- LEFT: text content -->
            <td valign="top" style="padding:44px 52px;vertical-align:top;">

              <p style="margin:0 0 6px;font-family:'Helvetica Neue',Arial,sans-serif;
                         font-size:10px;font-weight:600;letter-spacing:0.22em;
                         text-transform:uppercase;color:#9b8f82;">
                RSVP Confirmed
              </p>

              <h1 style="margin:0 0 4px;font-family:'Georgia',serif;font-size:30px;
                          font-weight:400;color:#2c2621;line-height:1.15;letter-spacing:-0.01em;">
                Jack &amp; Katerina
              </h1>

              <div style="width:36px;height:1px;background:#c9b99e;margin:14px 0;"></div>

              <p style="margin:0 0 24px;font-family:'Helvetica Neue',Arial,sans-serif;
                         font-size:12px;color:#7a6f66;line-height:1.6;letter-spacing:0.04em;">
                ${WEDDING_DATE}<br>
                ${VENUE}
              </p>

              <p style="margin:0 0 18px;font-size:16px;color:#2c2621;line-height:1.6;">
                Dear <strong>${partyName}</strong>,
              </p>

              <p style="margin:0 0 22px;font-size:15px;color:#4a3f35;line-height:1.7;">
                ${attendingMessage}
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                ${detailsBlock}
              </table>

              <p style="margin:0 0 28px;font-family:'Helvetica Neue',Arial,sans-serif;
                         font-size:12px;color:#9b8f82;line-height:1.6;">
                Need to change something? Visit our website to update your RSVP before <strong>${RSVP_DEADLINE}</strong>.
              </p>

              <p style="margin:0;font-size:16px;color:#2c2621;font-style:italic;line-height:1.5;">
                With love,<br>
                <strong style="font-style:normal;">Jack &amp; Katerina</strong>
              </p>

            </td></tr>
        </table>

        <table width="560" cellpadding="0" cellspacing="0"
               style="max-width:560px;width:100%;margin-top:20px;">
          <tr>
            <td align="center">
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;
                         font-size:11px;color:#b0a698;letter-spacing:0.08em;">
                <a href="${WEBSITE}" style="color:#9b8f82;text-decoration:none;">${WEBSITE}</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [email],
      subject: `Your RSVP — Jack & Katerina`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return json({ error: "Failed to send email" }, 500);
  }

  return json({ success: true }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}