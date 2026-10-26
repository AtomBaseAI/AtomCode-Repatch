# AtomCode Student — Desktop Client (Electron)

A student-only desktop client for the **AtomCode** learning platform, built with
Electron + vanilla HTML/CSS/JS (no build step). It talks to the Next.js backend
through a dedicated token-authenticated API at `/api/desktop/*`.

> Note: the folder is intentionally named `elcetron` (as requested).

## Features

- 🔐 **Student-only login** — staff/admin credentials are rejected with a clear message
- 📊 **Dashboard** — enrolled courses, module progress, average score, assessment readiness
- 📚 **My Courses** — progress bars per course → active modules with MCQ/code status
- 🧠 **MCQ practice** — options A–D, server-side grading (correct answers never sent to the client)
- 💻 **Code practice** — editor with tab support, *Run sample* / *Run hidden tests* (executed
  **server-side** via the judge proxy — the client never sees hidden test cases or the judge URL)
- ⏱ **Assessments** — access-key entry, countdown timer, MCQ + coding sections, final submit
- 🏆 **Results** — module and assessment score tables
- ⚙️ **Settings** — profile editing, password change, server address, service status

## Run it

```bash
cd elcetron
npm install        # or: bun install
npm start          # or: bun start / npx electron .
```

The app opens a login window:

| Field | Value |
|---|---|
| Server address | `http://localhost:3000` (default — change it to your deployed AtomCode URL) |
| Email | any seeded student, e.g. `student@atom.com` |
| Password | `User@Atom` |

> Useful env: `ATOMCODE_URL=http://localhost:3000 npm start` loads a live web page
> inside the shell instead of the bundled renderer (development helper).

## How auth works

1. `POST /api/desktop/auth/login` verifies the student email/password (bcrypt) and
   returns an **HMAC-SHA256 signed token** (7-day TTL, same secret family as web sessions).
2. Every subsequent call sends `Authorization: Bearer <token>`.
3. Tokens are stateless — logout simply discards them client-side.

The token, profile and server URL are persisted in `localStorage`.

## Backend endpoints consumed

All endpoints live under `/api/desktop` on the Next.js server:

| Endpoint | Method | Purpose |
|---|---|---|
| `/auth/login` | POST | Student login → token |
| `/auth/me` | GET | Current profile |
| `/auth/logout` | POST | Logout handshake |
| `/config` | GET | Public service flags (judge/AI availability) |
| `/student/dashboard` | GET | Aggregated stats |
| `/student/courses` | GET | Enrolled courses + progress |
| `/student/courses/[cid]/modules` | GET | Active modules + per-module progress |
| `/student/modules/[mid]` | GET | Sanitized MCQs/code questions/references/progress |
| `/student/practice/module` | POST | Start/submit module tracking |
| `/student/practice/mcq` | POST | Submit MCQ attempt (graded server-side) |
| `/student/practice/code` | POST | Submit coding solution |
| `/run` | POST | Server-side judge proxy (sample + hidden tests) |
| `/student/assessments` | GET | Assessments with dynamic status |
| `/student/assessments/[aid]/start` | POST | Access-key validation → open/resume attempt |
| `/student/assessments/[aid]` | GET | Attempt detail (sanitized questions) |
| `/student/assessments/[aid]/submit` | POST | Save MCQ/code results + finalize |
| `/student/results` | GET | Module + assessment results |
| `/student/profile` | GET / PATCH | Profile read/update |
| `/student/profile/password` | POST | Change password |

## Security notes

- Renderer runs with `contextIsolation: true`, `nodeIntegration: false`; HTTP is
  proxied through the main process (no CORS exposure).
- Correct MCQ options and hidden test-case inputs/expected outputs **never leave the server**.
- The judge (lambda) URL is only read server-side; the desktop app only learns
  whether the service is configured.

## Project layout

```
elcetron/
├── main.js            # Electron main process + IPC HTTP proxy
├── preload.js         # contextBridge (window.atomcode)
├── renderer/
│   ├── index.html     # login + app shell
│   ├── styles.css     # violet shadcn theme (light/dark)
│   └── app.js         # views: dashboard, courses, practice, assessments, results, settings
├── assets (icons) also under renderer/assets/
├── package.json
└── README.md
```

## Build & Distribute

Packaging uses **electron-builder** (config lives in the `"build"` field of
`package.json`; output goes to `dist/`).

```bash
npm install          # once (installs electron + electron-builder)

npm run build        # unpacked build for the current OS  -> dist/<os>-unpacked/
npm run export       # installers for the current OS
npm run export:linux # AppImage + .deb
npm run export:win   # NSIS installer + portable .exe (x64)
npm run export:mac   # .dmg + .zip
npm run export:all   # tries all three platforms at once
```

Notes:
- `npm run build` is a fast sanity check (no installer); run the produced
  binary from `dist/linux-unpacked/` etc. to smoke-test.
- From **Linux**, `export:win` additionally requires **wine**
  (`sudo apt install wine64`) because Windows exe resources must be edited;
  `export:mac` must be run on **macOS**.
- Installer names follow `${productName}-${version}-${os}-${arch}.${ext}`,
  e.g. `AtomCode Student-1.0.0-linux-x86_64.AppImage`.
- Windows NSIS installer is user-level (not one-click), lets the user pick the
  install folder and creates desktop/start-menu shortcuts ("AtomCode Student").
- `dist/` is git-ignored.
