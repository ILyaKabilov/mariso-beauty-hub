import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingPayload {
  name: string;
  phone: string;
  service: string;
  master: string;
  date: string;
  time: string;
  comment?: string;
  lang?: string;
}

function validate(b: any): { ok: true; data: BookingPayload } | { ok: false; error: string } {
  if (!b || typeof b !== "object") return { ok: false, error: "Invalid body" };
  const fields = ["name", "phone", "service", "master", "date", "time"];
  for (const f of fields) {
    if (typeof b[f] !== "string" || !b[f].trim()) return { ok: false, error: `Missing field: ${f}` };
    if (b[f].length > 300) return { ok: false, error: `Field too long: ${f}` };
  }
  if (b.comment && (typeof b.comment !== "string" || b.comment.length > 1000))
    return { ok: false, error: "Invalid comment" };
  return { ok: true, data: b as BookingPayload };
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const result = validate(body);
    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const d = result.data;

    const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
    if (!token || !chatId) {
      return new Response(JSON.stringify({ error: "Telegram is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text =
      `💅 <b>Новая заявка MariSo</b>\n\n` +
      `👤 <b>Имя:</b> ${escapeHtml(d.name)}\n` +
      `📱 <b>Телефон:</b> ${escapeHtml(d.phone)}\n` +
      `💇 <b>Услуга:</b> ${escapeHtml(d.service)}\n` +
      `✨ <b>Мастер:</b> ${escapeHtml(d.master)}\n` +
      `📅 <b>Дата:</b> ${escapeHtml(d.date)}\n` +
      `⏰ <b>Время:</b> ${escapeHtml(d.time)}\n` +
      (d.comment ? `💬 <b>Комментарий:</b> ${escapeHtml(d.comment)}\n` : "") +
      (d.lang ? `\n🌐 Язык: ${escapeHtml(d.lang)}` : "");

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });

    const tgData = await tgRes.json();
    if (!tgRes.ok) {
      console.error("Telegram error", tgData);
      return new Response(JSON.stringify({ error: "Telegram send failed", details: tgData }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
