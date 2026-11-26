# check-submission (ИИ проверка практики)
1. SQL Editor: запустить supabase/006_submissions.sql.
2. Console.anthropic.com: отдельный Workspace "nextgen" с лимитом расходов, в нём новый API key. Ключ никому не отправлять.
3. Supabase → Edge Functions → Deploy a new function → имя check-submission → вставить index.ts → Deploy (Verify JWT оставить включённым).
4. Edge Functions → Secrets → добавить ANTHROPIC_API_KEY (значение: ваш ключ). Необязательно AI_MODEL.

## partner-bot (Telegram: одобрение заявок партнёров)
1. @BotFather → /newbot → токен. Токен только в Supabase Secrets как TELEGRAM_BOT_TOKEN.
2. Secrets: ADMIN_TG_ID (твой числовой Telegram ID, можно узнать у @userinfobot), WEBHOOK_SECRET (любая длинная случайная строка).
3. Запустить 009_partner_approval.sql.
4. Edge Functions → создать partner-bot, вставить index.ts, выключить Verify JWT, Deploy.
5. Открыть в браузере https://<project>.supabase.co/functions/v1/partner-bot?setup=<WEBHOOK_SECRET> (ответ ok:true).
6. Database → Webhooks → создать: таблица partner_applications, событие Insert, Edge Function partner-bot, заголовок x-telegram-bot-api-secret-token = WEBHOOK_SECRET.
