// Telegram-бот для заявок партнёров: присылает новую заявку админу с кнопками «Одобрить / Отклонить».
// Секреты (в Supabase → Edge Functions → Secrets): TELEGRAM_BOT_TOKEN, ADMIN_TG_ID, WEBHOOK_SECRET.
// Проверка JWT у этой функции выключена: её вызывают Telegram и Database Webhook, защита - секретный заголовок.
import { createClient } from "npm:@supabase/supabase-js@2";

const TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!, SECRET = Deno.env.get("WEBHOOK_SECRET")!;
const ADMIN = Number(Deno.env.get("ADMIN_TG_ID"));
const SELF = `${Deno.env.get("SUPABASE_URL")}/functions/v1/partner-bot`;
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tg = (m: string, b: Record<string, unknown>) =>
  fetch(`https://api.telegram.org/bot${TOKEN}/${m}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
const ok = () => new Response("ok");

Deno.serve(async (req) => {
  // Одноразовая настройка: открыть в браузере  .../partner-bot?setup=<WEBHOOK_SECRET>
  if (req.method === "GET") {
    if (new URL(req.url).searchParams.get("setup") !== SECRET) return new Response("forbidden", { status: 403 });
    const r = await tg("setWebhook", { url: SELF, secret_token: SECRET, allowed_updates: ["callback_query"] });
    return new Response(await r.text());
  }
  if (req.headers.get("x-telegram-bot-api-secret-token") !== SECRET) return new Response("forbidden", { status: 403 });
  const u = await req.json().catch(() => null);
  if (!u) return ok();

  // Новая заявка (Database Webhook, событие INSERT)
  if (u.type === "INSERT" && u.record) {
    const a = u.record;
    const text = `<b>Новая заявка преподавателя</b>\n${esc(a.name)} · ${esc(a.topic)}\n${esc(a.email)}` +
      (a.telegram ? `\n${esc(a.telegram)}` : "") + (a.description ? `\n\n${esc(String(a.description).slice(0, 500))}` : "");
    await tg("sendMessage", {
      chat_id: ADMIN, text, parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "✅ Одобрить", callback_data: "a:" + a.id }, { text: "❌ Отклонить", callback_data: "r:" + a.id }]] },
    });
    return ok();
  }

  // Нажатие кнопки
  const q = u.callback_query;
  if (!q) return ok();
  if (q.from.id !== ADMIN) { await tg("answerCallbackQuery", { callback_query_id: q.id, text: "Нет доступа" }); return ok(); }
  const [act, id] = String(q.data || "").split(":");
  if (!/^[ar]$/.test(act) || !/^[0-9a-f-]{36}$/.test(id)) return ok();
  const status = act === "a" ? "approved" : "rejected";
  const { data, error } = await db.from("partner_applications").update({ status }).eq("id", id).select("email").single();
  if (error || !data) { await tg("answerCallbackQuery", { callback_query_id: q.id, text: "Ошибка, смотрите логи функции", show_alert: true }); return ok(); }
  let note = "";
  if (status === "approved") {
    const { data: p } = await db.from("profiles").select("id").ilike("email", data.email).limit(1);
    note = p?.length ? " Роль преподавателя выдана." : " Аккаунта с этой почтой пока нет: роль выдастся при первом входе.";
  }
  await tg("editMessageText", {
    chat_id: q.message.chat.id, message_id: q.message.message_id, parse_mode: "HTML",
    text: esc(q.message.text) + "\n\n" + (status === "approved" ? "✅ Одобрено." : "❌ Отклонено.") + esc(note),
  });
  await tg("answerCallbackQuery", { callback_query_id: q.id });
  return ok();
});
