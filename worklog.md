# Worklog — AtomCode Reimplementation into Template

---

Task ID: 0
Agent: main (orchestrator)
Task: Clone repo, init template, plan the parallel reimplementation.

Work Log:
- Cloned https://github.com/AtomBaseAI/AtomCode-Repatch → /home/z/my-project/AtomCode-Repatch
- Repo contains 3 Next.js 14 apps: Atom-Code-Admin (298 files, 2.6M), Atom-Code-Staff (194 files, 1.7M), Atom-Code-Student (139 files, 1.4M)
- Stack in repo: next-auth v5 beta, Prisma (PostgreSQL), Tailwind 3, shadcn/ui, CodeMirror, bcrypt-ts
- Initialized Z.ai fullstack template (Next.js 16, React 19, src/ layout, Prisma 6.11 SQLite, Tailwind 4, shadcn/ui full set)
- Template .env: DATABASE_URL=file:/home/z/my-project/db/custom.db
- Plan: ONE unified app in template with role-based areas (admin/staff/student), keeping repo UI + folder conventions (actions/, app/, components/, data/, hooks/, lib/, schemas/, routes.ts, middleware.ts)

Stage Summary:
- Phase 1 starting: 4 parallel Explore agents (admin/staff/student inventory + cross-app diff)

---

Task ID: 1-c
Agent: Explore (student inventory)
Task: Deep inventory of Atom-Code-Student (Next.js 14 App Router) for port into Next.js 16 template.

Key findings:
- ROUTES: 3 route groups: (auth) [login, register], (user) [dashboard, courses(+[course]/module), assessments, settings, lab, 2 loading.tsx, layout w/ await auth()], (atom) [practice + assessment w/ fullscreen-proctor client layouts]. Root: layout (Inter font, metadata from NEXT_PUBLIC_CLIENT_NAME), page = redirect('/login'), not-found. Only API route: /api/auth/[...nextauth] (re-exports from auth.ts). 14 pages total.
- QUIRK: practice dynamic segment is literally named `id]` (folder `app/(atom)/practice/[cid]/id]/`), i.e. `[mid]` lost its bracket → static segment, params.mid is undefined at runtime, practice deep links 404. Must be restored as `[mid]` when porting.
- LOGIN: email + password credentials (NOT regNo). Register: name, rollnumber, batch, department, section, email, password. Assessment gate: 6-digit OTP-style access key (InputOTP) matched against Assessments.accesskey + camera/clipboard permission requests.
- AUTH: next-auth v5 beta.5, auth.ts (PrismaAdapter + jwt strategy, session callback sets session.user.id = token.sub; user shape {id,name,email,image} — no role) + auth.config.ts (Credentials authorize → LoginSchema → getUserByEmail → bcrypt-ts compare). middleware.ts wraps NextAuth(authConfig), routes.ts: publicRoutes ["/"], authRoutes ["/login","/register"], apiAuthPrefix "/api/auth", DEFAULT_LOGIN_REDIRECT "/dashboard"; matcher ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'].
- ACTIONS (9 files, all "use server", no auth() inside — uid passed from client): login, register (bcrypt-ts hashSync), logout, user (updatestudent, resetpasswordstudent → db.user), submitmcq (UserMCQData create, currently unused by UI), submitquestion (submitquestion create/update-by-retake via @@unique(userId,questionId), submitcode noop), submitmodule (startModule create UserModuleData, mcqdataUpdateModule, codedataUpdateModule aggregates UserQuestionData, endModule sets modulestatus submitted, legacy submitModule dead code), assessment (startAssessment creates UserAssessmentData returns uaid, mcqdataUpdateAssessment, submitassessmentquestion, submitassessmentallquestions aggregates), ai (OpenAI chat → ATOM AI tutor, key NEXT_PUBLIC_APP_AI, model NEXT_PUBLIC_APP_MODEL). revalidatePath used ('/practice','/courses','/assessments','/assessment','/','/atom'); no redirect() in actions.
- CODE EXECUTION: NO local judge/endpoint. Client fetch to `${NEXT_PUBLIC_LAMBDA_URL}/${lang}` (sample run: resp.data.compileMessage Success/Failed/Error + output) and `${NEXT_PUBLIC_LAMBDA_MULTI_URL}/${lang}` (test_case1..3). Scoring client-side: sample=1pt, hidden tc=3pts each. Blacklist/whitelist keyword checks client-side only. Code saved to UserQuestionData/userAssessmentCodeData (usercode, testcase1..3status, compiles, errors, duration).
- MCQ: fully client-graded (1pt/correct), submit → mcqdataUpdateModule/mcqdataUpdateAssessment. Feedback: read-only list (data/feedbacks.ts) w/ date-window status.
- COMPONENTS: 25 ui files (shadcn new-york, slate). Custom ~31: 2 IDEs (practice code-view 874L, assessment-code-view 863L; @uiw/react-codemirror, vscodeDark/eclipse via next-themes, dynamic-import @codemirror/lang-java/cpp/python, custom keyword completions, copy/paste/right-click blocked, localStorage drafts `${uaid|umid}_${qid}`, no AtomAI in assessment IDE), mcq-view ×2, module-view/module-action (start/resume/retake + tabs Practice/References/Result), concept-preview (iframe dialog), assessment flow (assessmentcard, assessment-prepare OTP, assessment-home, top-bar w/ MCQ⇄Code select + END TEST typed confirm, timer, tab-switch-alert), atom-ai (Sheet + react-markdown + CodeMirror), sidebar/topbar, custom-calender, settings user-edit/user-password, auth forms.
- LIB: db.ts (global PrismaClient singleton), utils.ts (cn only). HOOKS: fullscreen (enter/exit/check), MouseEnter/MouseLeave (clipboard wipe), NetworkDector (online status + slow-2g toast), eschandle (no-op Esc listener). SCHEMAS: 8 zod files. DATA: 10 query files.
- PRISMA: postgresql, 20 models (Admin, SuperAdmin, Staff, User, Course, Feedbacks, Module, ModuleReferences, UserModuleData, Question, UserQuestionData, MCQQuestion, UserMCQData, StaffCourse, UserCourse, Account, Assessments, userAssessmentMCQData, userAssessmentCodeData, UserAssessmentData). NO enums, NO Json fields, @db.Text only on Account tokens. Account model malformed (non-nullable adminId/staffId/superadminId triple relation).
- ENV: DATABASE_URL, NODE_ENV, NEXT_PUBLIC_APP_AI, NEXT_PUBLIC_APP_MODEL, NEXT_PUBLIC_LAMBDA_URL, NEXT_PUBLIC_LAMBDA_MULTI_URL, NEXT_PUBLIC_CLIENT_NAME, NEXT_PUBLIC_VENDOR_NAME, NEXT_PUBLIC_VENDOR_LOGO, NEXT_PUBLIC_CLIENT_BANNER, NEXT_PUBLIC_POWEREDBY_STATUS/URL/NAME, NEXT_PUBLIC_APP_STATUS. No .env committed.
- THEME: shadcn HSL vars, primary violet (262.1 83.3% 57.8% light / 263.4 70% 50.4% dark), radius .3rem, purple scrollbar #7700ff, global user-select:none, tailwind class darkMode + tailwindcss-animate, Inter via next/font.
- NEXT16 BREAKERS: sync `params.x` in 7 server files (needs await params); next/dynamic ssr:false ×2 (client comps, still flag); useFormState 0; cookies()/headers() 0; mode:"insensitive" 0; images.domains 0 (remotePatterns has wildcard hostname '**'); next-auth beta.5 + Prisma 6 + React 18 → upgrade; routes hardcoded via string templates (~25+ links: /dashboard,/courses,/login,/register,/practice/…,/assessment/…).
- PUBLIC: Lang/*.svg ×7 (c,cpp,java,javascript,python,ruby,typescript), code.webp, next.svg, vercel.svg.

---

Task ID: 1-b
Agent: Explore (staff inventory)
Task: Deep inventory of Atom-Code-Staff (Next.js 14 App Router) for port into Next.js 16 template.

Key findings:
- ROUTES: 3 route groups: (auth) [login, register — server pages rendering client LoginForm/RegisterForm], (staff) [layout w/ await auth() + Sidebar/Topbar; dashboard, courses (+loading), courses/[cid] (+students,feedbacks), courses/[cid]/modules/[mid]/{code,mcq,references}, results (+loading), results/[cid]/{leaderboard,completion,analysis}, results/[cid]/analysis/[mid] (+insights/[uid]), workspace, ide, settings], (ide) [atom/[cid]/[mid] code playground — NO layout, bare root shell]. Root: layout (Inter, ThemeProvider, sonner Toaster, "ATOM Code Staff"), page=redirect('/login'), not-found. 2 loading.tsx, 0 route.ts pages; only API route /api/auth/[...nextauth]. 17 pages total. ALL dynamic pages read `params` SYNC ({cid} = params, typed any) → must await in Next 16 (11 pages).
- STAFF LOGIN: /login (auth group), email+password, Credentials provider, middleware redirects unauth → /login, DEFAULT_LOGIN_REDIRECT /dashboard.
- ACTIONS (9 files, all "use server", NO auth() inside): login (zod + signIn credentials + AuthError), logout, register (db.staff.create, bcrypt-ts hashSync), staff (resetpasswordstaff db.staff.update), staffcourse (getstaffsbycourseid read), usercourse (getstudentsbycourseid read), references (add/update/delete db.moduleReferences, revalidatePath '/courses'), feedbacks (add/update/delete db.feedbacks, revalidatePath '/courses'), analysis (resetModuleForStudent → UserQuestionData+UserModuleData status 'retake', revalidatePath '/results'). No redirect() in actions; no grade-write actions.
- CODE EXECUTION: none server-side. Client fetch to NEXT_PUBLIC_LAMBDA_URL/{lang} + NEXT_PUBLIC_LAMBDA_MULTI_URL/{lang} (staff CodeView + OpenIDE are preview-only, scoring stub, no persistence).
- DATA (10 query files): courses (getAllStaffCourses/getCoursesWithMetadata/getAllCoursesModules — all scoped via staffCourses.some{staffId}), modules, mcq, questions, staffs (getStaffByEmail for authorize), students, feedbacks, references, analysis (module status counts + per-student + insights), results (leaderboardData aggregate+rank, courseCompletionData matrix). No seed.
- COMPONENTS: 30 ui/ files (shadcn new-york slate), 5 shared data-tables helpers (TanStack v8). ~53 custom, nearly all 'use client' (RHF+zod+useTransition dialogs: reference add/edit/delete, feedback add/edit/delete, staff-password, code-retake reset, login/register forms); server comps: topbar, code-question, rank-animations, form-error/success, r-view, mas-view, m-codeview/m-mcqview/m-references (useRouter w/o 'use client' — works only under client columns). insight-view + rc-viewhelper use react-to-pdf; student-analysis-piechart recharts.
- LIB: db.ts (global PrismaClient singleton), utils.ts (cn). HOOKS: fullscreen.ts, NetworkDector.tsx (OnlineStatus). EXPORT/: CompletionExport (papaparse CSV) + 2 button components. SCHEMAS: 11 zod files (course/module/question/mcq/staff/student/auth/feedback/references/result-analysis/result-matrix).
- AUTH: next-auth 5 beta.5 + @auth/prisma-adapter, jwt strategy, session callback sets only session.user.id = token.sub (user shape {id,name,email,image} — NO role). authorize → getStaffByEmail + bcrypt-ts compare. No pages config, no authorized callback. middleware: publicRoutes ['/'], authRoutes ['/login','/register'], apiAuthPrefix '/api/auth', matcher ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'].
- ROUTES.TS: 4 exports (publicRoutes, authRoutes, apiAuthPrefix, DEFAULT_LOGIN_REDIRECT='/dashboard'); imported by 2 files (middleware.ts, actions/login.ts); ~25 hardcoded internal path literals across sidebar(6), table view buttons(8), results Links(3), module-selector(/atom), code-view(/workspace), not-found, root redirect, middleware.
- PRISMA: postgresql, 20 models (same set as student app incl. Assessments trio + malformed Account w/ required adminId/staffId/superadminId). NO enums, NO Json, @db.Text only on Account tokens.
- ENV: NODE_ENV (lib/db), DATABASE_URL (schema), NEXT_PUBLIC_LAMBDA_URL, NEXT_PUBLIC_LAMBDA_MULTI_URL. No .env committed.
- THEME: primary violet 262.1 83.3% 57.8% light / 263.4 70% 50.4% dark, radius .3rem, purple #7700ff scrollbar + CodeMirror cursor, glass bg + rank keyframes; tailwind class darkMode, tailwindcss-animate, container centered 2xl 1400px; Inter via next/font.
- NEXT16 BREAKERS: sync params ×11 pages (0 useFormState, 0 cookies(), 0 mode:insensitive, 1 next/dynamic ssr:false in code-question.tsx, 0 images.domains — uses remotePatterns ik.imagekit.io). Also: next-auth beta.5, React 18, next-themes/dist/types import, tsconfig target es5, '@/*' → root (no src/).
- PUBLIC: Lang/*.svg ×7, imports/student-sample/Student_Upload_Sample.csv, next.svg, vercel.svg; docs/ = 1 student bulk-import CSV sample. structure.json + strucutre.json (typo) are sample payloads for completion/insights views.
- FUNCTIONAL SCOPE vs admin: staff = READ-ONLY instructor portal — only own StaffCourse courses; can manage module references + course feedbacks; views students/MCQs/code questions; preview IDE (/atom/cid/mid); results: leaderboard w/ rank animations, module analysis (completed/in-progress/retake/not-started), per-student insights + PDF + module RETAKE reset, completion matrix + CSV export; own password reset. No course/module/question/MCQ CRUD, no grading writes, no assessment UI.

---

Task ID: 1-a
Agent: Explore (admin inventory)
Task: Deep inventory of Atom-Code-Admin (Next.js 14 App Router) for port into Next.js 16 template.

Key findings:
- ROUTES: 2 route groups. (auth): /login /register /forgot-password (server pages, NO group layout, render client LoginForm/RegisterForm). (admin): layout.tsx awaits auth() → Sidebar+Topbar; pages: dashboard, settings, courses(+loading), courses/[cid]/{edit,modules,modules/[mid]/{edit,references,code,code/add,mcq,mcq/import},staffs,staffs/add,students,students/add,feedbacks,assessments,assessments/[aid]/{edit,code,code/add,mcq,mcq/import}}, questions(+loading, questions/edit/[qid]), staffs(+edit/[sid]), students(+loading,import,edit/[uid]), results(+loading), results/[cid]/{leaderboard,analysis,analysis/[mid],analysis/[mid]/insights/[uid],completion}, ide. Root: layout (Inter via next/font — NETWORK FETCH ISSUE in sandbox), page=redirect('/login'), not-found. 41 pages + 2 layouts + 4 loading + not-found. Only API route /api/auth/[...nextauth] (re-export GET/POST from auth.ts).
- PARAMS: ALL 15 dynamic server pages read `params` SYNC (`{ params: any }` + destructure) → must await in Next 16. 2 'use client' import pages (modules/[mid]/mcq/import, assessments/[aid]/mcq/import) take `params` as PROP → Next 16 breaks (use React.use()). 0 searchParams usage. 2 sample-payload JSONs committed in app/ (completion/structure.json, insights/[uid]/strucutre.json typo).
- LOGIN/ROLES: single admin login at /login (no ?role= param, no /admin-login). authorize() checks ONLY Admin model (getAdminByEmail + bcrypt-ts compare). SuperAdmin/Staff models exist but unused for admin auth. Session shape {id=token.sub, name, email, image} — NO role/regNo. next-auth 5 beta.25 + @auth/prisma-adapter, JWT strategy. No pages config, no authorized callback. middleware = separate NextAuth(authConfig) instance: unauth → /login, authRoute + logged in → /dashboard.
- ACTIONS (16 files, all "use server", ZERO call auth() — mutation safety relies only on middleware): login, logout, register (db.admin.create), admin (resetpasswordadmin — no safeParse!), course (3), module (5), question (3), mcq (4, importmcqs=papaparse+BulkImportMCQSchema), assessment (5), staff (4, addstaff safeParse but email-uniqueness wrongly checked vs db.admin), student (5 incl. importstudents CSV, default pw 'User@Atom'), staffcourse (3), usercourse (3), references (3), feedbacks (3), analysis (resetModuleForStudent → 'retake'). revalidatePath everywhere ('/courses','/questions','/staffs','/students','/results'); redirect() only via signIn redirectTo.
- CODE EXEC: no judge/sandbox. Client fetch `${NEXT_PUBLIC_LAMBDA_URL}/${lang}` (question-add-form runs 5 testcases, OpenIDE runs custom input). CodeMirror via @uiw/react-codemirror + lang-java/cpp/python, vscodeDark/eclipse.
- COMPONENTS: ui/ = 30 shadcn files (new-york, slate). Custom = 146 (100 'use client'); families: per-entity add/edit dialog forms (RHF+zod+useTransition+sonner), TanStack data-tables (8.11) w/ toolbar+columns+delete, deletehelper (useParams bridge), preview dialogs w/ CodeEditor, nav icon buttons (router.push), data-tables/ 5 shared helpers + config constants (departments/sections/batches/modulefilters/languages), results extras: insight-view + rc-viewhelper (react-to-pdf), printable-report, student-analysis-piechart (recharts), rank-animations. topbar/form-error/form-success server comps.
- LIB: db.ts (global PrismaClient singleton), utils.ts (cn only). HOOKS: fullscreen.ts. EXPORT/: 3 files (module CSV button, completion CSV button+transform). SCHEMAS: 14 zod files. DATA: 12 query files (pure Prisma reads; NOT seed data — only UI constants in components/data-tables/data-table-config-data.tsx + question-table/q-config-data.tsx).
- ROUTES.TS: publicRoutes ['/'], authRoutes ['/login','/register'], apiAuthPrefix '/api/auth', DEFAULT_LOGIN_REDIRECT '/dashboard'. Imported by only 2 files (middleware, actions/login). ~44 hardcoded internal path literals (sidebar 8, router.push template 18, Link static 6, Link template 9, redirect 3).
- PRISMA: postgresql, 20 models (Admin, SuperAdmin, Staff, User, Course, Feedbacks, Module, ModuleReferences, UserModuleData, Question, UserQuestionData, MCQQuestion, UserMCQData, StaffCourse, UserCourse, Account, Assessments, userAssessmentMCQData, userAssessmentCodeData, UserAssessmentData). NO enums, NO Json, @db.Text only on Account tokens; Account malformed (required adminId/staffId/superadminId).
- ENV: DATABASE_URL (schema), NODE_ENV (lib/db), NEXT_PUBLIC_LAMBDA_URL (OpenIDE + question-add-form). No .env committed. ik.imagekit.io remotePatterns (settings avatar + topbar fallback img).
- THEME: violet primary 262.1 83.3% 57.8% light / 263.4 70% 50.4% dark, radius .3rem, #7700ff scrollbar + CodeMirror cursor, glass bg, rank keyframes; tailwind class darkMode + tailwindcss-animate, container 2xl 1400px; shadcn chart config; Inter next/font.
- NEXT16 BREAKERS: sync params ×15 server pages; params-as-prop ×2 client pages; 0 useFormState/cookies()/headers()/mode:insensitive/ssr:false/unstable_/images.domains; next-auth beta.25, React 18, next-themes/dist/types import, tsconfig target es5, '@/*'→root (no src/), Inter google-font fetch.
- PUBLIC: Lang/*.svg ×7 (UNUSED in admin), imports/student-sample CSV, vercel/next.svg; app/favicon.ico; docs/ = 1 CSV sample only.
- SIZE ESTIMATE: UI-critical 224 files (48 app + 146 custom comps + 30 ui) vs logic 51 (actions 16, data 12, schemas 14, lib 2, auth 3, routes 1, export 3, hooks 1).


---

Task ID: 1-d
Agent: Explore (cross-app diff analysis)
Task: Compare Admin/Staff/Student apps (prisma, auth, routes, ui, lib, actions, styling, deps, env, routes, nav, docs, config, otp) to plan ONE unified Next.js 16 app.

Stage Summary (key lists only):
- PRISMA: Admin==Student byte-identical; Staff = OLDER schema (no Module.concepturl, no Question/MCQQuestion↔Assessments links, old UserAssessmentData shape). UNION = 19 models (Admin, SuperAdmin, Staff, User=student, Course, Module, ModuleReferences, Question, MCQQuestion, UserModuleData, UserQuestionData, UserMCQData, StaffCourse, UserCourse, Account, Assessments, userAssessmentMCQData, userAssessmentCodeData, UserAssessmentData). ZERO enums, ZERO Json fields. Only @db: 3x @db.Text in Account tokens (strip for SQLite). Relation web is cross-role: Course→Modules/Assessments/StaffCourse/UserCourse/Feedbacks; UserCourse/UserModuleData/MCQData/QuestionData + assessment data tables all hang off User(id) + Course + Module + Assessments; Account FKs Admin+Staff+SuperAdmin (all required!) — rework Account for unified auth (drop or make optional). Merged schema = Admin/Student version (superset) + keep StaffCourse/Staff.
- AUTH: next-auth v5 beta, JWT strategy, credentials-only, PrismaAdapter. auth.ts identical Admin==Staff; auth.config.ts differs ONLY in authorize lookup (getAdminByEmail / getStaffByEmail / getUserByEmail); middleware byte-identical (comment-level diff only); NO role stored in session (session.user.id only) — role inferred implicitly per app. Unified auth feasible: single authorize that checks User→Staff→Admin→SuperAdmin + add role to JWT/session token. Cookie: default next-auth v5 (authjs.session-token), same in all 3 (each app is separate origin/db today).
- routes.ts: byte-identical x3 (publicRoutes ["/"], authRoutes ["/login","/register"], apiAuthPrefix "/api/auth", DEFAULT_LOGIN_REDIRECT "/dashboard"). Used ONLY by middleware + actions/login.ts — NOT for navigation.
- UI: Admin==Staff all 30 components/ui files byte-identical. Student = 25 (extra: context-menu, input-otp, progress, radio-group, sheet; missing: avatar, badge, calendar, chart, checkbox, command, dropdown-menu, popover, switch, textarea; only tooltip.tsx differs = extra Portal wrapper). Repo ui = old forwardRef shadcn; template = new data-slot shadcn (API-compatible). Template covers 34/35 union files; missing only components/ui/use-toast.ts (template keeps hooks/use-toast.ts).
- Non-ui components: 9 paths common to all 3 (only theme-provider/theme-toggle byte-identical; sidebar/topbar/auth forms differ cosmetically). Admin∩Staff share 63 (50 identical, 13 differ: register-form, backbtn, sidebar, cs-columns, c-columns, c-data-table, c-modules, c-students, mc-columns, mq-columns, m-columns, mas-columns, rc-viewhelper). Staff-only: code/code-question, code/code-view, settings/staff-password, workspace/module-selector. Student-only: 25 (assessment/*, practice/*, settings/user-*, submit-module, user-auth, custom-calender).
- lib: db.ts identical x3; utils.ts = cn() identical except admin's commented block.
- actions: login.ts + logout.ts identical x3; register.ts differs x3 (creates db.admin / db.staff / db.user). Admin∩Staff: analysis, feedbacks, references identical; staff/staffcourse/usercourse differ (admin=CRUD+createMany, staff=read/self-scope). Student-only: ai.ts (OpenAI SDK), assessment.ts, user.ts, submitmcq/submitmodule/submitquestion.
- data: feedbacks identical x3; courses/mcq/modules differ (student = user-scoped variants); Admin∩Staff identical: analysis, questions, references, results, students; staffs differs (getStaffsCount vs getStaffByEmail). Student-only: user, mcq-results, module-result, questions-result.
- schemas: auth-schema differs x3 (student adds rollnumber/batch/department/section; staff adds staffnumber/department/phone); mcq-schema differs; A∩S identical: feedback, question, references, result-analysis, result-completion, student; differ: course, module, result-matrix, staff. Student-only: user-schema, usercourse-schema, usersavemcq-scheam(typo), usersavemodule-schema, usersavequestion-schema, assessment-schema.
- export/: Admin==Staff (3 files, xlsx export via react-to-pdf/papaparse); Student none.
- hooks: fullscreen admin==staff (.ts); student fullscreen.tsx (no SSR guard) + MouseEnter/MouseLeave/eschandle/NetworkDector (staff NetworkDector differs slightly).
- Styling: tailwind.config.ts identical x3 (TW3 + tailwindcss-animate, slate, HSL vars). globals.css color VALUES identical x3 (violet theme); admin 175 / staff 174 / student 111 lines (student drops some CodeMirror/scrollbar styles). Port to TW4 = @theme inline + @custom-variant dark, straightforward.
- next.config.js: admin==staff (images: ik.imagekit.io), student adds wildcard hostname '**'. postcss identical (tw+autoprefixer). All fonts: Inter via next/font/google (sandbox build needs offline font or swap; template uses Geist).
- Deps conflicts: @prisma/client 6.11.1/6.2.1/6.7.0, prisma dev 6.11.1/6.7.0/6.11.1, next-auth beta.25/beta.5/beta.5, date-fns 3.3.1/3.3.1/4.1.0, radix dialog 1.0.5 vs 1.1.4, select 2.0.0 vs 2.1.2, toast 1.2.1 vs 1.1.5, tooltip 1.0.7 vs 1.1.6. Staff-only: bcryptjs(+types). Student-only: openai, react-markdown, input-otp, radix context-menu/progress/radio-group. Admin+Staff only: @tanstack/react-table, papaparse(+types), react-to-pdf, recharts, react-day-picker, cmdk, @auth/core. All apps: next ^14.2.4 / react ^18. Template missing: next-auth v5 beta (has v4!), @auth/prisma-adapter, bcrypt-ts, @uiw/react-codemirror + 2 themes, @codemirror/autocomplete+lang-cpp/java/python, openai, papaparse, react-to-pdf. Template already has: @tanstack/react-table, date-fns 4, input-otp, react-markdown, recharts, full radix set.
- ENV vars: NEXT_PUBLIC_LAMBDA_URL (all 3, code judge), NEXT_PUBLIC_LAMBDA_MULTI_URL (staff+student code-view), NEXT_PUBLIC_APP_AI + NEXT_PUBLIC_APP_MODEL (student ai.ts OpenAI), NEXT_PUBLIC_APP_STATUS, NEXT_PUBLIC_CLIENT_NAME, NEXT_PUBLIC_CLIENT_BANNER, NEXT_PUBLIC_POWEREDBY_NAME/STATUS/URL, NEXT_PUBLIC_VENDOR_NAME/LOGO (student auth pages+layout white-labeling). DATABASE_URL via prisma schema only. No .env files committed.
- ROUTE COLLISIONS if merged under (admin)/(staff)/(student) groups as-is (groups add NO url prefix): /login, /register, / (all 3), /dashboard (3x), /courses (3x), /settings (3x), /results (admin+staff), /ide (admin+staff), /api/auth/[...nextauth] (3x), not-found/favicon (3x). Slug-name conflict: /courses/[cid] (admin+staff) vs /courses/[course] (student) — invalid in one Next app → pick single param name or real prefixes (/admin/... /staff/... /student/...). BROKEN dirs found: literal "id]" folders (mangled [mid]) in admin courses/[cid]/modules/* + results/[cid]/analysis/*, staff courses/[cid]/modules/* + (ide)/atom/[cid]/id], student (atom)/practice/[cid]/id] — must be renamed [mid]. Also typo files "strucutre.json".
- NAV: 100% hardcoded strings/template literals (router.push, Link href, isActive checks); routes.ts unused for nav. Hardcoded path occurrences: admin: /courses 62, /assessment 37, /results 25, /students 15, /staffs 13, /questions 12, /assessments 11, /ide 8, /login 6, /dashboard 5, /settings 3, /register 3. staff: /results 25, /courses 22, /login 6, /ide 5, /dashboard 5, /workspace 4. student: /assessment 29, /practice 19, /dashboard 12, /courses 11, /assessments 7, /login 7.
- DOCS: Admin/docs + Staff/docs = "Student bulk import sample.csv" only (name,department,batch,rollnumber,email,isActive,section). Repo root: only .git + .DS_Store + 3 app dirs (no README/CI). .DS_Store noise = 2 (repo root, Atom-Code-Admin).
- OTP/EMAIL: input-otp used ONLY in student components/assessment/client/assessment-prepare.tsx = 6-slot assessment ACCESS-KEY entry (matches Assessments.accesskey Int) — NOT student email verification. No email infra anywhere (no nodemailer/resend/smtp); User.isTwoFactorEnabled always false & unused.

---

Task ID: 2 + 3 (foundation)
Agent: main (orchestrator)
Task: Unified foundation — deps, prisma schema (SQLite), auth, middleware, theme, shared components, seed.

Work Log:
- Installed: next-auth@5.0.0-beta.32, bcrypt-ts, @uiw/react-codemirror + vscode/eclipse themes, @codemirror/autocomplete + lang-java/cpp/python, papaparse(+types), react-to-pdf, openai, @radix-ui/react-icons
- prisma/schema.prisma: unified 19 models on SQLite; DROPPED SuperAdmin + malformed Account models; isTwoFactorEnabled @default(false); db push OK
- .env reduced to essentials: DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_LAMBDA_URL, NEXT_PUBLIC_LAMBDA_MULTI_URL, optional OPENAI_API_KEY/OPENAI_MODEL (branding vars -> src/config/branding.ts defaults)
- Auth: src/auth.config.ts (single credentials authorize: admin -> staff -> user lookup, bcrypt-ts compare, returns {id,name,email,image,role}), src/auth.ts (jwt+session callbacks stamp role; pages.signIn=/login), src/types/next-auth.d.ts (role augmentation), src/middleware.ts (standalone edge middleware using @auth/core/jwt decode; role guards for /admin,/staff,/student; authRoutes redirect to role home)
- src/routes.ts: publicRoutes, authRoutes, apiAuthPrefix, ROLE_HOME, roleHome()
- src/actions/{login,logout,register}.ts: login is role-aware (signIn redirectTo roleHome); register exported as registerAdmin/registerStaff/registerStudent
- Theme: globals.css ported to Tailwind 4 (@theme inline) with original violet HSL palette, radius 0.3rem, scrollbar/glass/rank/CodeMirror CSS preserved; root layout with Inter font + ThemeProvider + sonner Toaster + branding config
- src/app/(auth)/login (student branding + branding config), src/app/(auth)/register (role tabs: Student/Staff/Admin forms)
- Shared components copied from repo: sidebar (admin canonical, prefixed), topbar, backbtn, theme-provider (fixed next-themes 0.4 import), theme-toggle, auth forms (login-form + 3 register forms), form-error/success, logout-button, data-tables/* (5 shared), hooks/fullscreen.ts, hooks/NetworkDector.tsx
- prisma/seed.ts: admin/staff/student demo accounts + Full Stack Java course, 2 modules, MCQs, code questions, 1 assessment (accesskey 123456), feedback — SEEDED
- next.config.ts: merged images.remotePatterns ik.imagekit.io + standalone + ignoreBuildErrors
- Fixed: bcrypt-ts default import -> named {compare}; register form exports renamed (RegisterFormAdmin/Staff/Student); schema alias imports fixed
- VERIFIED in browser: / 307->/login, login page renders violet theme, register renders role tabs, E2E login admin@atom.com/Admin@Atom -> /admin/dashboard redirect works (JWT + middleware role guard OK)

Stage Summary:
- Foundation complete and browser-verified. Phase 3 starting: 3 parallel porting agents (admin/staff/student areas) with strict file-ownership partitions.

---

Task ID: 5-8 (session 2 completion)
Agent: main (orchestrator) + 3 diff agents + 3 impl agents
Task: Scan Core_SRC for pending/missing features, fix all gaps, verify build+runtime, produce test credentials.

Work Log:
- Re-cloned repo (workspace was reset), reinstalled deps (bun, 854 pkgs)
- Fixed 6 mangled route dirs (id] -> [mid]) in admin/staff/student app trees
- 3 parallel Explore agents diffed Core_SRC Admin/Staff/Student vs src/:
  * ADMIN: 25 pages had malformed awaited-params types (Promise<{...> } -> fixed via script); src/actions/assessment.ts had lost the 5 admin CRUD exports (addassessment, deleteassessment, updateassessment, addassessmentquestions, deleteassessmentquestion) -> restored; sidebar isActive legacy paths + /settings -> /admin/settings fixed
  * STAFF: shared components hardcoded /admin/... drill-downs -> created 7 staff variants (m-codeview, m-mcqview, m-references, ma-view, mas-view, c-feedbacks, ma-columns) + repointed staff column imports; dual revalidatePath (/admin + /staff) in references/feedbacks/analysis actions; getStaffByEmail restored in data/staffs.ts
  * STUDENT: no missing pages/actions/data/schemas; verified IDE (localStorage drafts, copy/paste block, lambda URLs), accesskey flow, proctor layouts, AI tutor intact
- Fixed leftover staff analysis page import -> staff ma-columns variant
- Type-error cleanup: 0 TS errors (auth route handlers export, results.ts parts typing, feedback schema zod v4 message, 4 forms useForm 3-generic zod v4 pattern, coerce input cast, tsconfig excludes Core_SRC + examples)
- .env + .env.example: 7 essentials (DATABASE_URL, AUTH_SECRET, LAMBDA x2, OPENAI x2) ; next.config images wildcard; forgot-password stub; .gitignore created
- Seed expanded: 2 admins, 2 staff, 3 students, enrollments (staff2/student3 unenrolled for empty-state tests); re-seeded, sqlite verified
- Production build: SUCCESS (all routes compile, standalone output)
- Runtime E2E (dev server): 7/7 logins -> role homes; bad password rejected (CredentialsSignin); cross-role guards 307; anon guards 307; logged-in /login -> role home; 59/59 valid pages 200 across admin(31)/staff(18)/student(10)
- Note: /student/courses/[course] has no page in ORIGINAL either (layout+module only) - faithful parity
- Note: parent workspace .env had stale DATABASE_URL (overrode repo .env via shell export) - repointed to repo db
- Credentials doc: download/TEST-CREDENTIALS.md + docs/TEST-CREDENTIALS.md (7 accounts, accesskey 123456, env essentials)

Stage Summary:
- Session 2 COMPLETE. All Core_SRC features ported/verified; build green; runtime auth+pages green; test credentials for all roles delivered.
