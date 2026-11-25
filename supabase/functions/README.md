# check-submission (ИИ проверка практики)
1. SQL Editor: запустить supabase/006_submissions.sql.
2. Console.anthropic.com: отдельный Workspace "nextgen" с лимитом расходов, в нём новый API key. Ключ никому не отправлять.
3. Supabase → Edge Functions → Deploy a new function → имя check-submission → вставить index.ts → Deploy (Verify JWT оставить включённым).
4. Edge Functions → Secrets → добавить ANTHROPIC_API_KEY (значение: ваш ключ). Необязательно AI_MODEL.
