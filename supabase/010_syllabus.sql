-- 010: у каждого курса есть Syllabus. Текст хранится в курсе (RU и EN), преподаватель правит его в редакторе курса.
alter table public.courses add column if not exists syllabus_ru text check (char_length(syllabus_ru) <= 20000);
alter table public.courses add column if not exists syllabus_en text check (char_length(syllabus_en) <= 20000);

-- Syllabus курса "Website with AI"
update public.courses set
  syllabus_ru = $q$## Основные данные

1. Название дисциплины: Website with AI (платформа NextGen), онлайн-курс по созданию и публикации сайта вместе с ИИ.
2. Преподаватель: Казиев Актилек, студент 3 курса направления «Прикладная математика и информатика», Международный университет Ала-Тоо, Бишкек. Опыт: репетитор по математике, наставник, волонтёр. Формат: онлайн.
3. Контакты: Telegram @AktilekKaziev, kazievaktilek41@gmail.com.
4. Кредиты: курс не входит в кредитную систему вуза и бесплатный.
5. Дата: 2026 г., осенний семестр.

## Цель и задачи

Цель курса: помочь студенту собрать и опубликовать собственный работающий сайт, правильно используя ИИ-ассистента: ставить задачу, проверять ответ и нести ответственность за результат.

### Познавательные задачи

  - Объяснить, из чего состоит сайт (HTML, CSS, база данных, домен, хостинг).
  - Показать, что такое хороший запрос к ИИ и почему ответ нужно проверять.
  - Познакомить с основами права и безопасности веб-сайта.
### Практические задачи

  - Составить план сайта и сделать адаптивный лендинг.
  - Сделать магазин с каталогом и заказом и обучающий сайт с уроком.
  - Подключить базу данных и вход для пользователей.
  - Опубликовать сайт на бесплатном хостинге и проверить его с телефона.
### Методические задачи

  - Привить работу итерациями: шаг, проверка в браузере, следующий шаг.
  - Научить выбирать инструменты под задачу сайта, а не наоборот.
### Аналитические задачи

  - Критически оценивать ответы ИИ: запускать код, сверять факты, находить ошибки.
  - Проверять сайт по списку критериев (работает ли на телефоне, открываются ли все ссылки).
### Этические и профессиональные задачи

  - Соблюдать академическую честность: отличать свою работу от работы ИИ и честно это описывать.
  - Не публиковать пароли, ключи доступа и персональные данные; знать, какие данные собирает сайт и зачем.

## Описание курса

Курс «Website with AI» практический: за 10 модулей студент проходит путь от идеи до опубликованного сайта. Каждый модуль состоит из теории, практики и домашнего задания. Практику студент сдаёт на платформе (текст, ссылка, до трёх скриншотов), первую проверку делает ИИ, сложные и спорные работы смотрит преподаватель. Следующий модуль открывается после принятой практики.

Актуальность: ИИ-ассистенты ускоряют разработку, но без понимания цели и проверки результата человек получает нерабочий или небезопасный сайт. Курс учит работать с ИИ как с напарником, а не как с автоматом «сделай всё».

Основное содержание:

- работа с ИИ-ассистентом: запросы, проверка ответов;
- планирование сайта, лендинг, интернет-магазин, обучающий сайт;
- база данных и вход пользователей;
- домен, DNS и публикация (deploy);
- право и безопасность: персональные данные, политика конфиденциальности, защита ключей;
- финальный проект: собственный опубликованный сайт.

В результате студент должен уметь:

- формулировать запросы к ИИ и проверять результат;
- спроектировать структуру сайта под конкретную цель;
- собрать адаптивный сайт на HTML и CSS;
- подключить базу данных и настроить правила доступа;
- опубликовать сайт и проверить его работу;
- оценить юридические и защитные риски своего сайта.

Компетенции выпускника:

- профессиональные: умение создавать и публиковать сайт с помощью ИИ;
- аналитические: критическая оценка ответов ИИ и качества сайта;
- коммуникативные: умение понятно описать задачу и результат своей работы;
- этические: честность в работе с ИИ, защита данных пользователей.

## Пререквизиты и постреквизиты

Пререквизиты. Нужны только базовые навыки:

- умение работать с компьютером и браузером;
- умение создавать аккаунты в онлайн-сервисах и загружать файлы;
- понимание, что такое ссылка, файл и папка;
- опыт программирования не требуется, желательна идея сайта, который студент хочет сделать.

Постреквизиты. После курса студент может заниматься:

- веб-разработкой на заказ и фрилансом: сайты для малого бизнеса и проектов;
- углублённым изучением веб-технологий: JavaScript, базы данных, безопасность веб-приложений;
- проектной работой: портфолио из опубликованных сайтов, участие в проектах с другими студентами.

## Краткое содержание дисциплины

Курс учит создать сайт от идеи до публичной ссылки, используя ИИ на каждом шаге и проверяя его работу. Модули 1–2: работа с ИИ и планирование сайта. Модули 3–5: лендинг, интернет-магазин и обучающий сайт. Модули 6–8: база данных и вход, доменное имя, публикация. Модуль 9: право и безопасность. Модуль 10: финальный проект, собственный опубликованный сайт с репозиторием и описанием того, что сделано с ИИ, а что самостоятельно.

Курс идёт на платформе NextGen на русском и английском языках. Видеоуроки размещаются на YouTube по ссылке; в текущей версии модули содержат текстовую теорию, практику и домашнее задание, видео добавляются по мере готовности.

Сертификат NextGen не является государственным документом об образовании. Он подтверждает прохождение курса на платформе и проверяется по публичной ссылке или QR-коду.

## Литература и ресурсы

Курс опирается на официальную документацию инструментов, которые используются в модулях.

Основные ресурсы:

1. MDN Web Docs (https://developer.mozilla.org) — справочник по HTML, CSS и JavaScript
2. Руководство по составлению запросов к Claude (https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview)
3. Supabase (https://supabase.com/docs) — база данных, вход и правила доступа
4. GitHub Pages (https://docs.github.com/pages) — публикация сайта

Дополнительные ресурсы:

1. web.dev (https://web.dev) — адаптивность, скорость и доступность сайтов
2. Закон Кыргызской Республики «О персональной информации» — для модуля 9.

## Политика выставления баллов

Каждая из 10 практик оценивается по шкале от 1 до 5. Оценка 4 или 5 означает, что практика принята и следующий модуль открыт. Оценка 3 и ниже означает, что нужна доработка: студент может исправить работу и сдать её снова.

Критерии проверки каждой практики:

| Оценка | Значение | Результат |
|---|---|---|
| 5 | Задание выполнено полностью, верно и понятно | Принято |
| 4 | Задание выполнено, есть небольшие пробелы | Принято |
| 3 | Выполнено частично, не хватает важных частей | Нужна доработка |
| 2 | Большая часть отсутствует или сделана неверно | Нужна доработка |
| 1 | Не по теме, пусто или скопировано без работы | Нужна доработка |

Кто проверяет:

- ИИ-помощник оценивает только то, что видно в работе, и даёт короткий отзыв: что получилось и что исправить.
- Работа передаётся преподавателю, если ИИ не уверен в оценке, не может проверить задание (например, открыть сайт по ссылке) или в работе есть только ссылка. Финальный проект всегда проверяет преподаватель.
- Преподаватель может принять работу или вернуть её на доработку с комментарием.

Дополнительные положения:

- Работа, скопированная без собственного участия, получает оценку 1.
- Если в работе оказался секретный ключ или пароль, оценка не выше 3, и студенту нужно отозвать ключ.
- Лимит ИИ-проверки: 6 проверок на модуль и 25 в сутки на одного студента.
- Дедлайнов нет: курс проходится в своём темпе.

Условия получения сертификата: приняты все 10 практик, включая финальный проект, проверенный преподавателем.

## Политика курса

### Академические требования

  - Практики выполняются студентом лично. ИИ-ассистента использовать нужно — это часть курса.
  - Использование ИИ нужно отмечать: в работе видно, что сделано ИИ, а что самим студентом.
  - Домашние задания выполняются самостоятельно.
### Порядок прохождения

  - Модули проходятся по порядку. Следующий открывается после принятой практики.
  - Если практика вернулась на доработку, студент читает отзыв, исправляет и сдаёт снова.
### Сроки

  - Жёстких дедлайнов нет, штрафы за просрочку не начисляются.
  - Для студентов, сдающих работы в рамках семестра, срок устанавливает преподаватель.
### Академическая честность

  - Обсуждать задания с другими студентами можно, сдавать чужую работу нельзя.
  - Скопированная работа получает оценку 1.
### Безопасность и данные

  - Нельзя публиковать пароли, ключи доступа и личные данные других людей в работах.
  - На платформе виден только ник вида user1038; текст работ передаётся сервису ИИ-проверки (Anthropic, США), об этом есть в политике конфиденциальности.
### Сертификат

  - Сертификат NextGen не является государственным документом об образовании.

## Содержание тем по видам занятий

Курс состоит из 10 модулей, около 46 часов работы (оценка): 10 ч теории, 24 ч практики и 12 ч домашних заданий.

| № | Тема | Теория (ч) | Практика (ч) | Домашнее задание (ч) |
|---|---|---|---|---|
| 1 | Знакомство: ИИ как напарник | 1 | 2 | 1 |
| 2 | Планирование сайта | 1 | 2 | 1 |
| 3 | Лендинг с ИИ | 1 | 2 | 1 |
| 4 | Интернет-магазин | 1 | 2 | 1 |
| 5 | Обучающий сайт | 1 | 2 | 1 |
| 6 | База данных и вход | 1 | 2 | 1 |
| 7 | Домен и DNS | 1 | 2 | 1 |
| 8 | Публикация (deploy) | 1 | 2 | 1 |
| 9 | Право и безопасность | 1 | 2 | 1 |
| 10 | Финальный проект | 1 | 6 | 3 |
|  | ИТОГО | 10 | 24 | 12 |

Часы ориентировочные: фактическое время зависит от студента и будет уточнено после первых прохождений.
$q$,
  syllabus_en = $q$## Basic information

1. Name of the discipline: Website with AI (NextGen platform), an online course on building and publishing a website together with AI.
2. Instructor: Aktilek Kaziev, 3rd-year student of Applied Mathematics and Informatics, Ala-Too International University, Bishkek. Experience: math tutor, mentor, volunteer. Format: online.
3. Contacts: Telegram @AktilekKaziev, kazievaktilek41@gmail.com.
4. Credits: the course is outside the university credit system and is free.
5. Date: 2026, autumn semester.

## Purpose and objectives

The purpose of the course is to help the student build and publish a working website of their own, using an AI assistant properly: set the task, check the answer and take responsibility for the result.

### Cognitive objectives

  - Explain what a website consists of (HTML, CSS, database, domain, hosting).
  - Show what a good AI prompt is and why the answer must be checked.
  - Introduce the basics of website law and security.
### Practical objectives

  - Plan a website and build a responsive landing page.
  - Build a shop with a catalog and ordering, and a learning site with a lesson.
  - Connect a database and user sign-in.
  - Publish the site on free hosting and check it from a phone.
### Methodological objectives

  - Build the habit of working in iterations: step, browser check, next step.
  - Teach choosing tools for the site's task, not the other way round.
### Analytical objectives

  - Critically evaluate AI answers: run the code, verify facts, find mistakes.
  - Check the site against a list of criteria (works on a phone, all links open).
### Ethical and professional objectives

  - Keep academic integrity: tell your own work from the AI's and describe it honestly.
  - Never publish passwords, access keys or personal data; know what data a site collects and why.

## Course description

The course «Website with AI» is hands-on: over 10 modules the student goes from an idea to a published website. Each module has theory, a practice task and homework. The student submits the practice on the platform (text, a link, up to three screenshots); AI does the first check and the instructor reviews complex or disputed work. The next module opens after the practice is accepted.

Relevance: AI assistants speed up development, but without understanding the goal and checking the result a person gets a broken or unsafe site. The course teaches working with AI as a partner, not as a «do everything» machine.

Main content:

- working with an AI assistant: prompts, checking answers;
- site planning, landing page, online shop, learning site;
- database and user sign-in;
- domain, DNS and publishing (deploy);
- law and security: personal data, privacy policy, protecting keys;
- final project: your own published website.

After the course the student should be able to:

- write prompts for AI and check the result;
- design a site structure for a specific goal;
- build a responsive site in HTML and CSS;
- connect a database and set access rules;
- publish a site and check that it works;
- assess the legal and security risks of their site.

Graduate competencies:

- professional: ability to create and publish a site with AI;
- analytical: critical evaluation of AI answers and site quality;
- communicative: ability to clearly describe a task and the result of one's work;
- ethical: honesty when working with AI, protection of user data.

## Prerequisites and post-requisites

Prerequisites. Only basic skills are needed:

- comfortable use of a computer and a browser;
- creating accounts in online services and uploading files;
- knowing what a link, a file and a folder are;
- no programming experience is required; an idea for a site the student wants to build is welcome.

Post-requisites. After the course the student can move on to:

- commissioned web development and freelancing: sites for small businesses and projects;
- deeper web technologies: JavaScript, databases, web application security;
- project work: a portfolio of published sites, joining projects with other students.

## Summary of the discipline

The course teaches how to create a site from an idea to a public link, using AI at every step and checking its work. Modules 1–2: working with AI and planning a site. Modules 3–5: landing page, online shop and learning site. Modules 6–8: database and sign-in, domain name, publishing. Module 9: law and security. Module 10: the final project, your own published site with a repository and a description of what was done with AI and what independently.

The course runs on the NextGen platform in Russian and English. Video lessons are hosted on YouTube via link; in the current version the modules contain written theory, practice and homework, and videos are added as they are ready.

The NextGen certificate is not an official state education document. It confirms completion of the course on the platform and can be verified by a public link or QR code.

## Literature and resources

The course relies on the official documentation of the tools used in the modules.

Main resources:

1. MDN Web Docs (https://developer.mozilla.org) — HTML, CSS and JavaScript reference
2. Guide to writing prompts for Claude (https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview)
3. Supabase (https://supabase.com/docs) — database, sign-in and access rules
4. GitHub Pages (https://docs.github.com/pages) — publishing a site

Additional resources:

1. web.dev (https://web.dev) — responsiveness, speed and accessibility of sites
2. Law of the Kyrgyz Republic «On Personal Information», for module 9.

## Grading policy

Each of the 10 practice tasks is graded from 1 to 5. A grade of 4 or 5 means the practice is accepted and the next module opens. A grade of 3 or lower means revision is needed: the student can fix the work and submit it again.

Criteria for each practice:

| Grade | Meaning | Result |
|---|---|---|
| 5 | Task fully done, correct and clear | Accepted |
| 4 | Task done with minor gaps | Accepted |
| 3 | Partly done, important parts missing | Revision needed |
| 2 | Mostly missing or wrong | Revision needed |
| 1 | Off-topic, empty or copied without work | Revision needed |

Who checks:

- The AI assistant grades only what is visible in the work and gives short feedback: what is good and what to fix.
- The work goes to the instructor if the AI is unsure, cannot verify the task (for example open a site by link) or the work contains only a link. The final project is always checked by the instructor.
- The instructor can accept the work or return it for revision with a comment.

Additional provisions:

- Work copied without the student's own effort gets a grade of 1.
- If a secret key or password appears in the work, the grade is at most 3 and the student must revoke the key.
- AI check limit: 6 checks per module and 25 per day per student.
- No deadlines: the course is self-paced.

Certificate requirements: all 10 practice tasks are accepted, including the final project checked by the instructor.

## Course policy

### Academic requirements

  - Practice tasks are done by the student personally. Using an AI assistant is expected: it is part of the course.
  - Use of AI must be disclosed: the work shows what the AI did and what the student did.
  - Homework is done independently.
### Order of study

  - Modules are taken in order. The next one opens after an accepted practice.
  - If a practice is returned for revision, the student reads the feedback, fixes it and submits again.
### Deadlines

  - There are no hard deadlines and no late penalties.
  - For students submitting within a semester, the instructor sets the deadline.
### Academic integrity

  - Discussing tasks with other students is allowed; submitting someone else's work is not.
  - Copied work gets a grade of 1.
### Security and data

  - Never publish passwords, access keys or other people's personal data in your work.
  - Only a nickname like user1038 is shown on the platform; the text of submissions is sent to the AI-check service (Anthropic, USA), as described in the privacy policy.
### Certificate

  - The NextGen certificate is not an official state education document.

## Topics by type of activity

The course has 10 modules and about 46 hours of work (estimate): 10 h theory, 24 h practice and 12 h homework.

| No. | Topic | Theory (h) | Practice (h) | Homework (h) |
|---|---|---|---|---|
| 1 | AI as your partner | 1 | 2 | 1 |
| 2 | Planning your website | 1 | 2 | 1 |
| 3 | Landing page with AI | 1 | 2 | 1 |
| 4 | Online shop | 1 | 2 | 1 |
| 5 | Learning site | 1 | 2 | 1 |
| 6 | Database and sign-in | 1 | 2 | 1 |
| 7 | Domain and DNS | 1 | 2 | 1 |
| 8 | Going live (deploy) | 1 | 2 | 1 |
| 9 | Legal and security | 1 | 2 | 1 |
| 10 | Final project | 1 | 6 | 3 |
|  | TOTAL | 10 | 24 | 12 |

Hours are approximate: actual time depends on the student and will be refined after the first runs.
$q$
where slug = 'website-with-ai';
