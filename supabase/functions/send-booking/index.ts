import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();

    const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing");

    // Check if this is a Telegram Webhook (Callback Query)
    if (body.update_id && body.callback_query) {
      const cq = body.callback_query;
      const data = cq.data; // e.g. "confirm_uuid" or "reject_uuid"
      
      if (data.startsWith('confirm_') || data.startsWith('reject_')) {
        const action = data.split('_')[0];
        const appointment_id = data.split('_')[1];
        const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';

        // Update appointment in Supabase
        const { error: updateError } = await supabase
          .from("appointments")
          .update({ status: newStatus })
          .eq("id", appointment_id);

        let replyText = action === 'confirm' ? "✅ Запись подтверждена!" : "❌ Запись отменена!";
        
        if (updateError) {
          console.error("Update error:", updateError);
          replyText = "Ошибка при обновлении статуса.";
        }

        // Answer callback query
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callback_query_id: cq.id,
            text: replyText,
          }),
        });

        // Edit message text to append status and remove buttons
        const originalText = cq.message.text || "";
        let statusAppend = `\n\nСтатус: ${action === 'confirm' ? '✅ Подтверждена' : '❌ Отменена'}`;
        if (action === 'confirm') {
          statusAppend += `\n\n⚠️ Обязательно свяжитесь с клиентом, чтобы предупредить, что его запись подтвердили, и уточнить, придет ли он.`;
        }
        const updatedText = originalText + statusAppend;

        await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: cq.message.chat.id,
            message_id: cq.message.message_id,
            text: updatedText,
            reply_markup: { inline_keyboard: [] },
          }),
        });

        // Notify admins
        const { data: admins } = await supabase.from("admin_chats").select("tg_chat_id");
        if (admins) {
          let adminMsg = `Статус записи (ID: ${appointment_id}) изменен на: ${newStatus === 'confirmed' ? '✅ Подтвержден' : '❌ Отменен'} мастером.`;
          if (newStatus === 'confirmed') {
             adminMsg += `\n\n⚠️ Обязательно свяжитесь с клиентом, чтобы предупредить, что его запись подтвердили, и уточнить, придет ли он.`;
          }
          for (const admin of admins) {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: admin.tg_chat_id, text: adminMsg }),
            });
          }
        }
      }

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Otherwise, this is a new booking request from our Frontend
    const d = body;
    
    // Fetch master's telegram ID
    const { data: appointment } = await supabase.from('appointments').select('master_id').eq('id', d.appointment_id).single();
    let masterChatId = null;
    if (appointment && appointment.master_id) {
      const { data: master } = await supabase.from('masters').select('tg_chat_id').eq('id', appointment.master_id).single();
      masterChatId = master?.tg_chat_id;
    }

    const text =
      `💅 <b>Новая заявка MariSo</b>\n\n` +
      `👤 <b>Имя:</b> ${escapeHtml(d.name)}\n` +
      `📱 <b>Телефон:</b> ${escapeHtml(d.phone)}\n` +
      `💇 <b>Услуга:</b> ${escapeHtml(d.service)}\n` +
      `✨ <b>Мастер:</b> ${escapeHtml(d.master)}\n` +
      `📅 <b>Дата:</b> ${escapeHtml(d.date)}\n` +
      `⏰ <b>Время:</b> ${escapeHtml(d.time)}\n` +
      (d.comment ? `💬 <b>Комментарий:</b> ${escapeHtml(d.comment)}\n` : "");

    // Prepare inline keyboard
    const reply_markup = {
      inline_keyboard: [
        [
          { text: "✅ Подтвердить", callback_data: `confirm_${d.appointment_id}` },
          { text: "❌ Отменить", callback_data: `reject_${d.appointment_id}` }
        ]
      ]
    };

    const { data: admins } = await supabase.from("admin_chats").select("tg_chat_id");
    const adminIds = admins ? admins.map(a => a.tg_chat_id) : [];

    const recipients = new Set([...adminIds]);
    if (masterChatId) recipients.add(masterChatId);

    const sendResults = await Promise.all(
      Array.from(recipients).map(async (cid) => {
        // Strict logic: Only send buttons to the actual Master.
        const sendMarkup = (cid === masterChatId && masterChatId !== null) ? reply_markup : undefined;
        
        const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: cid, text, parse_mode: "HTML", reply_markup: sendMarkup }),
        });
        const data = await r.json();
        return { cid, ok: r.ok, data };
      })
    );

    return new Response(JSON.stringify({ success: true, sendResults }), {
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
