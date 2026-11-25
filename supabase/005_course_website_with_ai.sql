-- 005: курс "Website with AI" (только тексты, без видео). Запустить один раз в Supabase SQL Editor.
do $$
declare cid uuid; oid uuid;
begin
  select id into oid from public.profiles where role='admin' order by created_at limit 1;
  if oid is null then raise exception 'Нет администратора в profiles'; end if;
  insert into public.courses(slug,owner_id,title_ru,title_en,description_ru,description_en,category,language,status)
  values('website-with-ai',oid,'Website with AI','Website with AI',
    $q$Практический курс: вы собираете настоящие сайты вместе с ИИ и в конце публикуете свой.$q$,
    $q$A hands-on course: you build real websites with AI and publish your own at the end.$q$,'IT','ru','published')
  on conflict(slug) do update set title_ru=excluded.title_ru,title_en=excluded.title_en,description_ru=excluded.description_ru,description_en=excluded.description_en,status='published'
  returning id into cid;
  delete from public.modules where course_id=cid;
  insert into public.modules(course_id,position,title_ru,title_en,theory_ru,theory_en,practice_ru,practice_en,homework_ru,homework_en) values
  (cid,1,$q$Знакомство: ИИ как напарник$q$,$q$AI as your partner$q$,$q$ИИ-ассистент — это напарник, который быстро пишет черновики, объясняет непонятное и предлагает варианты. Он не знает вашей цели, пока вы её не назвали, и иногда уверенно ошибается.

Хороший запрос состоит из четырёх частей: кто вы и что делаете, что именно нужно получить, ограничения (объём, стиль, технологии), формат ответа. Чем точнее запрос, тем меньше правок.

Ответ ИИ всегда проверяйте: запускайте код, сверяйте факты, просите объяснить решение простыми словами. Решение принимаете вы.$q$,$q$An AI assistant is a partner that quickly writes drafts, explains things and suggests options. It does not know your goal until you say it, and sometimes it is confidently wrong.

A good prompt has four parts: who you are and what you are doing, exactly what you need, constraints (length, style, technology), and the answer format. The more precise the prompt, the fewer edits you make.

Always check the answer: run the code, verify facts, ask for an explanation in plain words. You make the decision.$q$,$q$Откройте любой ИИ-ассистент. Попросите его объяснить, что такое сайт и из чего он состоит, для человека без опыта. Затем уточните запрос по четырём частям из теории и сравните два ответа.

Отправьте: оба запроса, оба ответа (текстом или скриншотом) и 2–3 предложения о том, что стало лучше после уточнения.$q$,$q$Open any AI assistant. Ask it to explain what a website is and what it consists of, for a complete beginner. Then refine the prompt using the four parts from the theory and compare the two answers.

Submit: both prompts, both answers (text or screenshot) and 2–3 sentences on what improved after you refined it.$q$,$q$Придумайте тему сайта, который вы хотите сделать в этом курсе (например, магазин, портфолио, сайт кафе). Напишите 3 вопроса, которые вы зададите ИИ, чтобы лучше понять эту тему.$q$,$q$Pick the topic of the website you want to build in this course (for example a shop, a portfolio, a café site). Write 3 questions you will ask the AI to understand that topic better.$q$),
  (cid,2,$q$Планирование сайта$q$,$q$Planning your website$q$,$q$Сайт начинается не с кода, а с ответов на вопросы: для кого он, что человек должен сделать на нём (купить, записаться, прочитать) и чем вы отличаетесь от других.

Дальше составляется структура: список страниц и блоков на каждой. Для первого сайта хватит главной, страницы с описанием, контактов и формы заявки. Тексты пишутся до вёрстки: так видно, сколько места нужно под каждый блок.

ИИ хорошо помогает с вариантами структуры и черновиками текстов, но цель и факты о вашем деле даёте вы.$q$,$q$A website starts not with code but with answers: who it is for, what a visitor should do on it (buy, sign up, read), and how you differ from others.

Next comes the structure: a list of pages and the blocks on each. For a first site, a home page, an about page, contacts and a request form are enough. Write the copy before layout: then you see how much room each block needs.

AI helps with structure options and text drafts, but the goal and the facts about your business come from you.$q$,$q$С помощью ИИ составьте план вашего сайта: целевая аудитория (1–2 предложения), главное действие посетителя, список страниц, блоки главной страницы по порядку и заголовок с подзаголовком для первого экрана.

Отправьте план текстом.$q$,$q$With the help of AI, make a plan for your site: target audience (1–2 sentences), the visitor's main action, the list of pages, the home page blocks in order, and a headline with a subheading for the first screen.

Submit the plan as text.$q$,$q$Нарисуйте от руки эскиз главной страницы (прямоугольники и подписи) и приложите фото. Отметьте, где будет главная кнопка.$q$,$q$Draw a hand sketch of the home page (rectangles and labels) and attach a photo. Mark where the main button goes.$q$),
  (cid,3,$q$Лендинг с ИИ$q$,$q$Landing page with AI$q$,$q$Лендинг — одна страница с одной целью. Обычно в ней: первый экран с заголовком и кнопкой, преимущества, как это работает, отзывы или примеры, форма заявки и подвал с контактами.

Сайт на HTML и CSS — это текстовые файлы. HTML описывает содержимое, CSS — внешний вид. Просите ИИ делать страницу адаптивной: она должна одинаково хорошо выглядеть на телефоне и на компьютере.

Работайте итерациями: сначала каркас, потом стили, потом форма. После каждого шага открывайте страницу в браузере и проверяйте, прежде чем просить следующее.$q$,$q$A landing page is one page with one goal. It usually has: a first screen with a headline and a button, benefits, how it works, reviews or examples, a request form and a footer with contacts.

A site in HTML and CSS is just text files. HTML describes the content, CSS describes the look. Ask the AI to make the page responsive: it should look equally good on a phone and on a computer.

Work in iterations: first the skeleton, then styles, then the form. After each step open the page in a browser and check it before asking for the next thing.$q$,$q$Попросите ИИ собрать лендинг по вашему плану из модуля 2 в одном файле index.html с адаптивной вёрсткой. Откройте файл в браузере, проверьте на телефоне (или в режиме мобильного экрана в браузере).

Отправьте: скриншот страницы на компьютере и на телефоне и ваш запрос к ИИ.$q$,$q$Ask the AI to build a landing page from your module 2 plan as a single index.html with a responsive layout. Open the file in a browser and check it on a phone (or in your browser's mobile view).

Submit: a screenshot of the page on desktop and on mobile, and your prompt to the AI.$q$,$q$Улучшите страницу: поменяйте цвета и шрифт под ваш стиль, добавьте реальные тексты вместо заготовок. Отправьте новый скриншот.$q$,$q$Improve the page: change colors and the font to fit your style, add real text instead of placeholders. Submit a new screenshot.$q$),
  (cid,4,$q$Интернет-магазин$q$,$q$Online shop$q$,$q$Магазин — это каталог, карточка товара, корзина и оформление заказа. Пока вы не принимаете оплату, достаточно заявки: покупатель оставляет имя и контакт, а вы связываетесь с ним сами.

Для каждого товара нужны название, цена, фото, короткое описание. Данные удобно хранить в одном списке, а страницу собирать из него, а не писать карточки вручную.

Принимать платежи можно только через подключённые платёжные сервисы вашей страны и после того, как вы выполнили требования закона. Это тема модуля 9.$q$,$q$A shop is a catalog, a product page, a cart and checkout. Until you accept payments, a request is enough: the buyer leaves a name and contact and you get in touch yourself.

Each product needs a name, price, photo and a short description. It is convenient to keep the data in one list and build the page from it instead of writing every card by hand.

You can accept payments only through payment services available in your country, and only after meeting the legal requirements. That is the topic of module 9.$q$,$q$Попросите ИИ добавить к вашему сайту каталог из 4–6 товаров (или услуг), карточку товара и корзину или форму заказа. Данные о товарах пусть хранятся списком в коде.

Отправьте: скриншоты каталога и карточки товара и ссылку или описание, как работает заказ.$q$,$q$Ask the AI to add to your site a catalog of 4–6 products (or services), a product page and a cart or an order form. Let the product data live as a list in the code.

Submit: screenshots of the catalog and the product page, and a link or description of how ordering works.$q$,$q$Добавьте фильтр или поиск по каталогу. Отправьте скриншот и опишите, что попросили у ИИ.$q$,$q$Add a filter or search to the catalog. Submit a screenshot and describe what you asked the AI for.$q$),
  (cid,5,$q$Обучающий сайт$q$,$q$Learning site$q$,$q$Обучающий сайт состоит из курсов, уроков, прогресса и личного кабинета. Урок — это заголовок, текст теории, видео и задание. Список уроков в курсе упорядочен, а следующий урок можно открывать после выполнения предыдущего.

Прогресс хранится для каждого пользователя отдельно: какие уроки он завершил. Поэтому нужен вход в аккаунт, о чём модуль 6.

Удобный урок короткий: одна идея, один пример, одно задание.$q$,$q$A learning site consists of courses, lessons, progress and a personal account. A lesson is a title, theory text, a video and a task. The lessons in a course are ordered, and the next lesson can open after the previous one is done.

Progress is stored separately for every user: which lessons they finished. That requires sign-in, which module 6 covers.

A good lesson is short: one idea, one example, one task.$q$,$q$Спроектируйте страницу урока для вашего сайта: заголовок, блок видео, текст, задание, кнопки «Назад» и «Дальше». Попросите ИИ сверстать её и добавьте один настоящий мини-урок на любую тему.

Отправьте скриншот страницы урока и текст вашего мини-урока.$q$,$q$Design a lesson page for your site: a title, a video block, text, a task, and Back and Next buttons. Ask the AI to lay it out and add one real mini-lesson on any topic.

Submit a screenshot of the lesson page and the text of your mini-lesson.$q$,$q$Сделайте список из 3 уроков с переходом между ними. Отправьте скриншот и описание, как работает переход.$q$,$q$Make a list of 3 lessons with navigation between them. Submit a screenshot and a description of how the navigation works.$q$),
  (cid,6,$q$База данных и вход$q$,$q$Database and sign-in$q$,$q$Данные пользователей нельзя хранить в файлах сайта: их увидит любой. Для этого нужна база данных на сервере и вход в аккаунт. Готовые сервисы (например, Supabase) дают и то и другое.

Главное правило: в сайте можно хранить только публичные ключи. Секретные ключи и пароли нельзя вставлять в код страницы, нельзя отправлять в чат и нельзя выкладывать в репозиторий.

Доступ к данным настраивается правилами на стороне базы: пользователь видит только свои записи. Роли (ученик, преподаватель, администратор) тоже хранятся в базе, а не на странице.$q$,$q$User data cannot live in the site's files: anyone can see them. You need a server-side database and sign-in. Ready services (for example Supabase) provide both.

The main rule: only public keys may live in the site. Secret keys and passwords must never go into page code, into a chat or into a repository.

Access to data is set by rules on the database side: a user sees only their own records. Roles (student, instructor, admin) are also stored in the database, not on the page.$q$,$q$Создайте бесплатный проект в сервисе базы данных, добавьте таблицу, например «заявки» или «товары», и попросите ИИ объяснить каждое поле простыми словами. Включите правила доступа к таблице.

Отправьте скриншот таблицы и правил доступа. Не отправляйте ключи и пароли: ни секретные, ни любые другие.$q$,$q$Create a free project in a database service, add a table such as requests or products, and ask the AI to explain each field in plain words. Turn on access rules for the table.

Submit a screenshot of the table and the access rules. Do not send keys or passwords: neither secret ones nor any others.$q$,$q$Напишите своими словами: чем публичный ключ отличается от секретного и почему секретный нельзя держать на странице (3–5 предложений).$q$,$q$Write in your own words: how a public key differs from a secret one and why a secret one must not be kept on the page (3–5 sentences).$q$),
  (cid,7,$q$Домен и DNS$q$,$q$Domain and DNS$q$,$q$Домен — это адрес сайта вроде example.com. Его покупают у регистратора на год и продлевают. Один домен принадлежит одному владельцу, поэтому проверьте, что имя свободно.

DNS — это «телефонная книга» интернета. Записи DNS говорят, на какой сервер вести посетителей. Две основные: запись A или CNAME для самого сайта и запись TXT для подтверждения владения.

Изменения DNS применяются не мгновенно: от нескольких минут до суток. Если сайт не открылся сразу, подождите и проверьте записи ещё раз.$q$,$q$A domain is a site's address such as example.com. You buy it from a registrar for a year and renew it. One domain has one owner, so check that the name is free.

DNS is the internet's phone book. DNS records tell where to send visitors. The two main ones: an A or CNAME record for the site itself and a TXT record to prove ownership.

DNS changes are not instant: from a few minutes to a day. If the site did not open at once, wait and check the records again.$q$,$q$Подберите 3 варианта доменного имени для вашего сайта и проверьте, свободны ли они на сайте регистратора. Покупать домен не нужно.

Отправьте: список имён, скриншот проверки и ваш выбор с объяснением в одном предложении.$q$,$q$Come up with 3 domain name options for your site and check on a registrar's website whether they are free. You do not need to buy a domain.

Submit: the list of names, a screenshot of the check and your choice with a one-sentence reason.$q$,$q$Попросите ИИ объяснить на примере вашего домена, какие записи DNS нужны для сайта на бесплатном хостинге. Отправьте его ответ и что осталось непонятным.$q$,$q$Ask the AI to explain, using your domain as an example, which DNS records a site on free hosting needs. Submit its answer and anything that is still unclear.$q$),
  (cid,8,$q$Публикация (deploy)$q$,$q$Going live (deploy)$q$,$q$Публикация — это размещение файлов сайта на сервере, чтобы их мог открыть любой человек. Для статических сайтов есть бесплатные хостинги, например GitHub Pages: вы кладёте файлы в репозиторий, и они становятся доступны по ссылке.

После публикации обязательно проверьте: страницы открываются, картинки и стили на месте, форма работает, сайт нормально выглядит на телефоне, нет ошибок в консоли браузера.

Изменения вносятся так же: правите файлы, отправляете в репозиторий, сайт обновляется через минуту-две.$q$,$q$Publishing means putting the site's files on a server so anyone can open them. Static sites have free hosting such as GitHub Pages: you put the files in a repository and they become available at a link.

After publishing, always check: pages open, images and styles are in place, the form works, the site looks fine on a phone, and there are no errors in the browser console.

Changes go the same way: edit the files, push to the repository, and the site updates within a minute or two.$q$,$q$Опубликуйте ваш сайт на бесплатном хостинге. Откройте его по публичной ссылке с телефона и пройдите по всем страницам.

Отправьте: ссылку на сайт и список из 3 проверок, которые вы сделали, с результатом каждой.$q$,$q$Publish your site on free hosting. Open it by the public link from your phone and go through every page.

Submit: the site link and a list of 3 checks you did, with the result of each.$q$,$q$Найдите и исправьте одну ошибку на опубликованном сайте. Опишите, что нашли и как исправили.$q$,$q$Find and fix one mistake on the published site. Describe what you found and how you fixed it.$q$),
  (cid,9,$q$Право и безопасность$q$,$q$Legal and security$q$,$q$Если сайт собирает данные людей (имя, почта, телефон, аккаунты), нужны политика конфиденциальности, понятное согласие и возможность запросить удаление данных. Ссылки на документы должны быть доступны с любой страницы.

Требования зависят от страны, поэтому уточняйте их у юриста или в официальных источниках. Не копируйте чужие документы: они описывают чужой сайт.

Базовая безопасность: не храните секретные ключи на странице, выводите пользовательский текст безопасно, давайте пользователям только нужные права, используйте только https. Платежи принимайте через сертифицированные сервисы.$q$,$q$If a site collects people's data (name, email, phone, accounts), you need a privacy policy, clear consent and a way to request deletion of data. Links to the documents should be available from every page.

Requirements depend on the country, so confirm them with a lawyer or official sources. Do not copy someone else's documents: they describe someone else's site.

Basic security: keep secret keys off the page, output user text safely, give users only the rights they need, use https only. Accept payments through certified services.$q$,$q$Составьте для вашего сайта список: какие данные он собирает, зачем, где хранятся и кому доступны. Попросите ИИ помочь с черновиком политики конфиденциальности и отметьте, какие пункты нужно проверить у юриста.

Отправьте список данных и черновик политики.$q$,$q$Make a list for your site: what data it collects, why, where it is stored and who can access it. Ask the AI to help draft a privacy policy and mark which points need a lawyer's check.

Submit the data list and the policy draft.$q$,$q$Добавьте на сайт ссылку на политику конфиденциальности в подвале каждой страницы и отметку согласия у формы. Отправьте скриншоты.$q$,$q$Add a link to the privacy policy in the footer of every page and a consent checkbox next to the form. Submit screenshots.$q$),
  (cid,10,$q$Финальный проект$q$,$q$Final project$q$,$q$Финальный проект — ваш собственный сайт от идеи до публикации. Он собирает всё из курса: план, лендинг или магазин, при необходимости база данных и вход, публикация и юридические страницы.

Перед сдачей пройдите чек-лист: у сайта есть понятная цель, он адаптивен, ссылки работают, на каждой странице есть контакты, политика и согласие, в коде нет секретных ключей.

На проверке смотрят не на сложность, а на то, что сайт работает, и на то, что вы понимаете, как он устроен.$q$,$q$The final project is your own website from idea to launch. It brings together everything in the course: the plan, a landing page or shop, a database and sign-in if needed, publishing and the legal pages.

Before submitting, go through the checklist: the site has a clear goal, is responsive, links work, every page has contacts, a policy and consent, and no secret keys are in the code.

The review is not about complexity but about whether the site works and whether you understand how it is built.$q$,$q$Сдайте финальный проект: ссылку на опубликованный сайт, ссылку на репозиторий и описание (5–8 предложений): для кого сайт, какие страницы есть, что вы делали с ИИ, а что сами, что проверяли.$q$,$q$Submit the final project: the link to the published site, a link to the repository and a description (5–8 sentences): who the site is for, which pages it has, what you did with the AI and what you did yourself, and what you checked.$q$,$q$Попросите одного человека открыть сайт и рассказать, что ему непонятно. Запишите его замечания и что вы исправили.$q$,$q$Ask one person to open the site and tell you what is unclear. Write down their remarks and what you fixed.$q$);
end $$;
