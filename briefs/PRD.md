# Akshara Tools Suite — Master PRD
**Version:** 3.0 — Final Handoff  
**Prepared by:** Akshara Technologies  
**Date:** April 2026  
**Deployment:** tools.aksharatech.com  
**GitHub (main site):** https://github.com/sagarsavaliya/Akshara-Technologies  
**Registrar:** Hostinger → DNS: Cloudflare  

---

## AGENT ORCHESTRATION INSTRUCTIONS

This document is the **single source of truth** for the Akshara Tools Suite. A CEO agent must read this entire document first, then break it into specialist agent tasks in the exact sequence defined in Section 1. No task should begin until its dependency is marked complete. Every task has explicit acceptance criteria — the agent must self-verify before marking done.

**Specialist agents required:**
- **ARCH** — Architecture & project scaffold agent
- **CALC** — Calculation engine & unit test agent  
- **UI** — UI/UX component & styling agent
- **SEO** — SEO, schema & metadata agent
- **AUTH** — Authentication & user account agent
- **DB** — Database & storage agent
- **REVIEW** — Ratings, reviews & admin panel agent
- **QA** — Quality assurance & cross-device testing agent
- **DEPLOY** — Deployment & Cloudflare configuration agent

---

## SECTION 1 — TASK EXECUTION SEQUENCE

CEO agent must execute tasks in this order. Tasks marked `[PARALLEL]` can run simultaneously.

```
PHASE 1 — FOUNDATION (Days 1–2)
├── TASK 001  ARCH   Project scaffold, Vite + React 18, folder structure
├── TASK 002  ARCH   Shared design system — CSS tokens, typography, theme toggle
├── TASK 003  ARCH   Shared component library — Input, Slider, ResultCard, Button
├── TASK 004  ARCH   Navigation header + Footer component + routing shell
└── TASK 005  DB     Database setup — SQLite via Turso (libsql) + schema migration

PHASE 2 — AUTH SYSTEM (Day 2–3)
├── TASK 006  AUTH   User signup with email verification (prevent false signups)
├── TASK 007  AUTH   PIN-based login system (4-digit PIN, no passwords)
└── TASK 008  AUTH   Session management + protected routes

PHASE 3 — TOOL 1: SALARY CALCULATOR (Days 3–4) [HIGHEST PRIORITY]
├── TASK 009  CALC   Salary calculation engine + Jest test suite
├── TASK 010  UI     Salary calculator UI — viewport-fit, responsive, dual theme
└── TASK 011  SEO    Salary calculator SEO — meta, schema, FAQ, JSON-LD

PHASE 4 — TOOL 2: GST CALCULATOR (Days 4–5) [PARALLEL with Tool 1 QA]
├── TASK 012  CALC   GST calculation engine + invoice PDF generator + tests
├── TASK 013  UI     GST calculator + invoice UI
└── TASK 014  SEO    GST calculator SEO

PHASE 5 — TOOLS 3, 4, 5 (Days 5–7) [PARALLEL across agents]
├── TASK 015  CALC   SIP calculation engine + tests          [PARALLEL]
├── TASK 016  CALC   EMI calculation engine + tests          [PARALLEL]
├── TASK 017  CALC   TDEE + macro calculation engine + tests [PARALLEL]
├── TASK 018  UI     SIP calculator UI                       [PARALLEL]
├── TASK 019  UI     EMI calculator UI                       [PARALLEL]
├── TASK 020  UI     TDEE calculator UI                      [PARALLEL]
├── TASK 021  SEO    SIP SEO                                 [PARALLEL]
├── TASK 022  SEO    EMI SEO                                 [PARALLEL]
└── TASK 023  SEO    TDEE SEO                                [PARALLEL]

PHASE 6 — REVIEWS SYSTEM (Days 6–7)
├── TASK 024  DB     Reviews + users DB schema (Turso)
├── TASK 025  REVIEW Review UI — rating summary, write review, review cards
├── TASK 026  REVIEW Admin panel at /admin — reply, moderate, pin, export
└── TASK 027  SEO    AggregateRating JSON-LD schema per tool

PHASE 7 — QA + POLISH (Day 8)
├── TASK 028  QA     Cross-device testing (375px mobile → 1920px desktop)
├── TASK 029  QA     Lighthouse audit — all tools must score ≥ 95 performance
├── TASK 030  QA     Calculation accuracy verification — all test cases pass
└── TASK 031  QA     AdSense readiness — privacy policy, terms, about pages

PHASE 8 — FINAL HANDOFF (Day 9)
└── TASK 032  DEPLOY Local build verification + README for Sagar's review before push
```

---

## SECTION 2 — PROJECT CONTEXT & CONSTRAINTS

### 2.1 Business Context
- **Owner:** Sagar Savaliya, CEO, Akshara Technologies, Rajkot, Gujarat, India
- **Purpose:** Free tools site monetised via Google AdSense. Finance + Health niches = $8–35 USD RPM.
- **Revenue model:** AdSense auto-ads + 2 manual ad slots per tool page
- **Launch strategy:** Sagar tests locally first, then pushes to GitHub → Cloudflare Pages auto-deploys
- **No server-side rendering needed** — static SPA is fine, SEO handled via react-helmet-async + prerender

### 2.2 Hosting & Infrastructure
- **Domain:** tools.aksharatech.com (subdomain — Sagar will add DNS record after local testing)
- **Hosting:** Cloudflare Pages (free tier, GitHub Actions CI/CD)
- **Main site repo:** https://github.com/sagarsavaliya/Akshara-Technologies
- **Tools repo:** Create new repo `akshara-tools` under the same GitHub account
- **Database:** Turso (libsql) — SQLite edge database, free tier = 500MB + 1B reads/month
- **No Docker, no heavy backend** — keep it lean

### 2.3 Non-Negotiable Constraints
1. **Zero scroll to use the tool** — entire tool (inputs + results) fits in one viewport on every device
2. **No AI-generated aesthetic** — no generic shadcn/Tailwind default look, no card-heavy layouts that look like ChatGPT plugins
3. **Sub-100ms calculation response** — every keystroke updates results instantly, zero debounce on calc
4. **All monetary values** — `Math.round()` to nearest rupee. Never display floats in outputs.
5. **Tax config in one file** — `src/config/taxConfig.js` only. No hardcoded tax values in components.
6. **Mobile numeric keyboard** — all number inputs must have `inputMode="decimal"` or `inputMode="numeric"`
7. **Touch targets** — minimum 44×44px on all interactive elements
8. **Sagar deploys manually** — no auto-push to production. Build for local → GitHub → Cloudflare pipeline.

---

## SECTION 3 — DESIGN SYSTEM

### 3.1 Design Philosophy
The visual identity must feel like a **premium Indian fintech product** — think Groww, Zerodha Kite, or ET Money but lighter and faster. Not a generic calculator site. Not shadcn. Not Material UI defaults.

Key attributes:
- Clean, airy, lots of breathing room
- Numbers are the hero — large, bold, instantly readable
- Inputs feel tactile — custom sliders, smooth transitions
- Results appear with a subtle count-up animation (300ms)
- Professional but approachable — not cold like a bank, not playful like an app

### 3.2 Color Tokens — Full Specification

```css
/* Light Mode */
--clr-bg:           #F0F4F8;   /* page background — cool off-white, not pure white */
--clr-surface:      #FFFFFF;   /* tool card surface */
--clr-surface-2:    #F8FAFC;   /* input backgrounds, secondary surfaces */
--clr-surface-3:    #EFF6FF;   /* highlight backgrounds, info boxes */
--clr-border:       #CBD5E1;   /* default borders */
--clr-border-focus: #1A56DB;   /* focus ring color */
--clr-primary:      #1A56DB;   /* brand blue — CTAs, active states, links */
--clr-primary-h:    #1446C2;   /* primary hover */
--clr-primary-light:#EFF6FF;   /* primary tint background */
--clr-success:      #059669;   /* positive result — savings, gains */
--clr-success-light:#ECFDF5;   /* success tint */
--clr-warn:         #D97706;   /* caution — star ratings, warnings */
--clr-warn-light:   #FFFBEB;   /* warn tint */
--clr-danger:       #DC2626;   /* errors, negative values */
--clr-danger-light: #FEF2F2;   /* danger tint */
--clr-text-1:       #0F172A;   /* primary headings */
--clr-text-2:       #374151;   /* body text */
--clr-text-3:       #64748B;   /* secondary/muted text */
--clr-text-4:       #94A3B8;   /* placeholder, hints */

/* Dark Mode — applied via [data-theme="dark"] on <html> */
--clr-bg:           #0F172A;
--clr-surface:      #1E293B;
--clr-surface-2:    #253347;
--clr-surface-3:    #1E3A5F;
--clr-border:       #334155;
--clr-border-focus: #3B82F6;
--clr-primary:      #3B82F6;
--clr-primary-h:    #60A5FA;
--clr-primary-light:#1E3A5F;
--clr-success:      #10B981;
--clr-success-light:#064E3B;
--clr-warn:         #F59E0B;
--clr-warn-light:   #451A03;
--clr-danger:       #F87171;
--clr-danger-light: #450A0A;
--clr-text-1:       #F1F5F9;
--clr-text-2:       #CBD5E1;
--clr-text-3:       #94A3B8;
--clr-text-4:       #475569;
```

### 3.3 Typography

```css
/* Import in index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace; /* for numbers only */

/* Scale */
--text-xs:   11px / 1.4;
--text-sm:   13px / 1.5;
--text-base: 15px / 1.6;
--text-lg:   17px / 1.5;
--text-xl:   20px / 1.4;
--text-2xl:  24px / 1.3;
--text-3xl:  30px / 1.2;
--text-4xl:  38px / 1.1;  /* result numbers */
--text-5xl:  48px / 1.0;  /* hero result number */

/* Weights */
--fw-regular: 400;
--fw-medium:  500;
--fw-semibold:600;
--fw-bold:    700;
```

### 3.4 Spacing & Layout

```css
--radius-sm:  6px;
--radius-md:  10px;
--radius-lg:  14px;
--radius-xl:  20px;
--radius-full:9999px;

--shadow-sm:  0 1px 3px rgba(0,0,0,0.08);
--shadow-md:  0 4px 12px rgba(0,0,0,0.08);
--shadow-lg:  0 8px 24px rgba(0,0,0,0.10);

/* Tool layout — desktop */
--tool-max-width: 1100px;
--tool-sidebar-w: 420px;   /* inputs column */
--tool-result-w:  620px;   /* results column */
--tool-gap:       32px;

/* Tool layout — tablet (768–1099px) */
/* inputs: full width top, results: full width below — still no scroll */

/* Tool layout — mobile (< 768px) */
/* single column, inputs compressed, results compact */
```

### 3.5 Component Specifications

#### Input Field
```
Height:          52px desktop / 48px mobile
Border:          1.5px solid var(--clr-border)
Border-radius:   var(--radius-md)
Background:      var(--clr-surface-2)
Font:            var(--font-sans) 15px/500
Focus:           border-color: var(--clr-border-focus); 
                 box-shadow: 0 0 0 3px rgba(26,86,219,0.15)
Prefix/Suffix:   Inside field — ₹, %, yr, kg labels in --clr-text-3
inputMode:       "decimal" for all number fields (triggers numeric keyboard on mobile)
No spinners:     input[type=number] { -moz-appearance:textfield; }
                 input::-webkit-outer-spin-button, ::-webkit-inner-spin-button { display:none }
```

#### Range Slider
```
Track height:    5px; border-radius: full; background: var(--clr-border)
Fill:            var(--clr-primary) — JS-computed width from value position
Thumb:           22px circle; background: white; border: 2px solid var(--clr-primary)
                 box-shadow: 0 1px 4px rgba(0,0,0,0.2)
Thumb hover:     scale(1.15) with 150ms ease
Sync:            Slider ↔ Input field — bidirectional, zero debounce
```

#### Result Card (primary metric)
```
Background:      var(--clr-surface)
Border:          1px solid var(--clr-border)
Border-radius:   var(--radius-lg)
Padding:         24px 28px
Primary number:  var(--font-mono) 48px/700 var(--clr-primary) or var(--clr-success)
Animation:       Count-up from 0 to final value over 300ms on first load; instant on subsequent changes
Label:           11px/600 uppercase tracking-wide var(--clr-text-3)
Copy button:     Icon button top-right — copies formatted ₹X,XX,XXX to clipboard
                 Shows "Copied!" tooltip for 1.5s
```

#### Secondary Metric Grid
```
Layout:          2 or 3 column CSS grid below primary card
Each cell:       background var(--clr-surface-2); border-radius var(--radius-md)
                 padding 14px 16px
Number:          22px/600 var(--clr-text-1)
Label:           11px/500 uppercase var(--clr-text-3)
```

#### Theme Toggle Button
```
Position:        Top-right of tool header, alongside navigation
Icon:            Sun SVG (light mode) / Moon SVG (dark mode) — 20px
Background:      var(--clr-surface-2) pill shape
Transition:      All color properties 200ms ease
Persistence:     localStorage key: "akshara-theme"
Auto-detect:     On first visit: prefers-color-scheme media query sets default
```

#### Button — Primary
```
Height:          48px; padding: 0 24px; border-radius: var(--radius-md)
Background:      var(--clr-primary); color: white; font: 15px/600
Hover:           background var(--clr-primary-h); transform: translateY(-1px)
Active:          transform: translateY(0); box-shadow: none
Disabled:        opacity 0.5; cursor: not-allowed
```

### 3.6 Navigation Header

```
Height:          64px
Background:      var(--clr-surface) with border-bottom 1px var(--clr-border)
Position:        sticky top-0; z-index: 100
Backdrop:        backdrop-filter: blur(8px) — semi-transparent on scroll

Left:            Akshara Technologies logo + wordmark
                 Logo: use AT monogram SVG — circular, brand blue background, white letters
                 Wordmark: "Akshara Tools" in 17px/600 — NOT "Akshara Technologies" 
                           (keeps it tool-focused)
                 Clicking logo → / (home — tools directory)

Center (desktop):Tool navigation pills — horizontal scrollable on mobile
                 Active tool: filled pill background var(--clr-primary-light) 
                              text var(--clr-primary) border var(--clr-border-focus)
                 Inactive: transparent, text var(--clr-text-2), hover bg var(--clr-surface-2)
                 Pills: "Salary" | "GST" | "SIP" | "EMI" | "TDEE"
                 Font: 13px/500

Right:           Theme toggle + Auth buttons
                 - If not logged in: "Sign In" (ghost) + "Join Free" (primary)
                 - If logged in: Avatar circle (initials) + dropdown (My Reviews / Sign Out)

Mobile (<768px): Hamburger menu → slide-in drawer with all nav links
```

### 3.7 Footer

```
Background:      var(--clr-surface)
Border-top:      1px solid var(--clr-border)
Padding:         40px 0 24px

Three columns (desktop) / stacked (mobile):

Column 1 — Brand:
  Logo + "Akshara Tools"
  Tagline: "Free, accurate tools for everyday Indian financial decisions."
  "By Akshara Technologies" → links to aksharatech.com (opens new tab)
  Social: LinkedIn icon → aksharatech LinkedIn

Column 2 — Tools:
  Heading: "Our Tools"
  Links: Salary Calculator | GST Calculator | SIP Calculator | EMI Calculator | TDEE Calculator

Column 3 — Company:
  Heading: "Company"
  Links: About | Privacy Policy | Terms of Use | Report an Error
  Email: tools@aksharatech.com (or hello@aksharatech.com)

Bottom bar:
  Left: "© 2025 Akshara Technologies. All rights reserved."
  Right: "Calculations verified as per Union Budget 2025 | FY 2025-26"
  
Trust badges (inline):
  "Verified Formulas ✓" | "No Sign-up to Use ✓" | "100% Free ✓"
```

---

## SECTION 4 — TECH STACK

```
Framework:        React 18 + Vite 5
Routing:          React Router v6 (lazy-loaded per tool — each chunk <80KB gzipped)
Styling:          CSS Modules + CSS Custom Properties
                  NO Tailwind (bundle bloat)
                  NO shadcn (generic look)
                  NO styled-components (runtime overhead)
State:            useState + useReducer + Context (no Redux)
SEO:              react-helmet-async
Charts:           Chart.js 4.x (loaded only on SIP and EMI tools — code split)
PDF:              jsPDF + jsPDF-AutoTable (Tool 2 only — lazy loaded)
Database:         Turso (libsql) — SQLite edge DB
                  Client: @libsql/client
                  Free tier: 500MB storage, 1B row reads/month
Auth:             Custom — email OTP signup + 4-digit PIN login
                  Email: Resend.com (free tier: 3,000 emails/month)
                  No Firebase, no Auth0, no Supabase (keep dependencies lean)
Testing:          Vitest + React Testing Library
                  All calculation functions must have 100% test coverage
Hosting:          Cloudflare Pages
CI/CD:            GitHub Actions → Cloudflare Pages (auto on push to main)
Analytics:        Google Analytics 4 (gtag deferred — does not block FCP)
Ads:              Google AdSense (auto-ads enabled + 2 manual slots per page)
Performance:      Target Lighthouse ≥ 95 on mobile
                  FCP < 1.0s | LCP < 2.0s | CLS < 0.05 | TTI < 1.5s
```

### 4.1 Project Folder Structure

```
akshara-tools/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml          (auto-generated at build time)
│   └── og/                  (OG images per tool — 1200×630px)
├── src/
│   ├── config/
│   │   ├── taxConfig.js     ← SINGLE SOURCE OF TRUTH for all tax constants
│   │   ├── seoConfig.js     ← title, description, keywords per tool
│   │   └── adminConfig.js   ← admin password hash, moderation limits
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ToolLayout.jsx   (2-col desktop, 1-col mobile wrapper)
│   │   ├── ui/
│   │   │   ├── InputField.jsx
│   │   │   ├── SliderInput.jsx  (slider + number input synced)
│   │   │   ├── ResultCard.jsx   (primary metric with count-up)
│   │   │   ├── MetricGrid.jsx   (secondary metrics grid)
│   │   │   ├── ThemeToggle.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Toggle.jsx       (binary toggle — Metro/Non-Metro etc.)
│   │   │   ├── TabGroup.jsx     (tab switcher for Tool 2)
│   │   │   ├── CopyButton.jsx
│   │   │   └── Tooltip.jsx
│   │   ├── seo/
│   │   │   ├── ToolSEO.jsx      (react-helmet-async wrapper per tool)
│   │   │   └── JsonLd.jsx       (JSON-LD schema injection)
│   │   └── reviews/
│   │       ├── ReviewsSection.jsx
│   │       ├── RatingSummary.jsx
│   │       ├── WriteReview.jsx
│   │       ├── ReviewCard.jsx
│   │       ├── AdminReplyBlock.jsx
│   │       └── ReviewsList.jsx
│   ├── tools/
│   │   ├── SalaryCalculator/
│   │   │   ├── index.jsx
│   │   │   ├── SalaryCalculator.jsx
│   │   │   ├── salaryEngine.js   ← pure functions, no React
│   │   │   ├── salaryEngine.test.js
│   │   │   └── SalaryCalculator.module.css
│   │   ├── GSTCalculator/
│   │   │   ├── index.jsx
│   │   │   ├── GSTCalculator.jsx
│   │   │   ├── InvoiceGenerator.jsx
│   │   │   ├── gstEngine.js
│   │   │   ├── gstEngine.test.js
│   │   │   ├── invoicePdf.js
│   │   │   └── GSTCalculator.module.css
│   │   ├── SIPCalculator/
│   │   ├── EMICalculator/
│   │   └── TDEECalculator/
│   ├── pages/
│   │   ├── Home.jsx           (tools directory / landing page)
│   │   ├── Admin.jsx          (admin panel — protected route)
│   │   ├── About.jsx
│   │   ├── PrivacyPolicy.jsx  (required for AdSense)
│   │   └── TermsOfUse.jsx     (required for AdSense)
│   ├── auth/
│   │   ├── AuthContext.jsx
│   │   ├── SignupFlow.jsx
│   │   ├── LoginFlow.jsx
│   │   └── useAuth.js
│   ├── hooks/
│   │   ├── useTheme.js
│   │   ├── useReviews.js
│   │   └── useCountUp.js      (count-up animation hook)
│   ├── utils/
│   │   ├── formatters.js      (formatINR, formatPercent, numberToWords)
│   │   ├── validators.js
│   │   └── db.js              (Turso libsql client singleton)
│   ├── styles/
│   │   ├── tokens.css         (all CSS custom properties)
│   │   ├── global.css
│   │   └── reset.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── vite.config.js
├── package.json
└── README.md
```

---

## SECTION 5 — AUTHENTICATION SYSTEM

### 5.1 Philosophy
- **No signup required to USE any tool** — tools are fully public
- **Signup only required to** rate, review, or comment on a tool
- **No passwords** — friction kills conversions. PIN-based login only.
- **Email verification** — prevents fake accounts, keeps review quality high
- **One account — all tools** — single login works across all 5 tools

### 5.2 Signup Flow

```
Step 1 — Email entry
  Input: email address
  Validation: RFC 5322 regex + check against known disposable email domains list
  Disposable email domains to block: mailinator.com, guerrillamail.com, 
    tempmail.com, throwam.com, yopmail.com (maintain a blocklist of 50+ domains)
  On valid email → send 6-digit OTP via Resend.com
  OTP: Math.floor(100000 + Math.random() * 900000) — server-generated
  OTP expiry: 10 minutes
  Rate limit: max 3 OTP sends per email per hour

Step 2 — OTP verification
  6 input boxes (one digit each) — auto-advance on input
  Paste support: pasting "123456" fills all boxes
  Wrong OTP: show error, allow retry (max 5 attempts then lock 30 min)
  Correct OTP → proceed to Step 3

Step 3 — Set display name + 4-digit PIN
  Display name: max 40 chars, required, shown on reviews
  PIN: 4 numeric digits (not password — explicitly labelled as "Login PIN")
  PIN input: 4 boxes like OTP — same UX pattern
  Confirm PIN: repeat entry — must match
  PIN stored: bcrypt hash (cost factor 10) — NEVER store plain PIN

Step 4 — Account created
  Auto-login after signup
  Show: "Welcome, [Name]! You can now rate and review tools."
  Redirect back to the tool page they came from
```

### 5.3 Login Flow

```
Step 1 — Email entry
  Same email input as signup

Step 2 — PIN entry
  4-digit PIN input (same 4-box UI)
  Wrong PIN: show attempt count "2 of 5 attempts remaining"
  5 wrong attempts: 30-minute lockout — show countdown timer
  Correct PIN → logged in, redirect to previous page

"Forgot PIN?" flow:
  → Sends new OTP to email
  → Verify OTP → set new PIN
  → Invalidates old sessions
```

### 5.4 Session Management

```
Session token: cryptographically random 32-byte hex string
Storage: httpOnly cookie (if using a server) OR localStorage with short expiry
Expiry: 30 days (rolling — refreshed on each visit)
On logout: delete session token from DB + clear localStorage/cookie
Protected routes: /admin only — all tool pages are public
```

### 5.5 Database Schema — Users & Auth

```sql
-- Users table
CREATE TABLE users (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  pin_hash      TEXT NOT NULL,
  email_verified INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- OTP table (cleanup cron: delete expired OTPs)
CREATE TABLE otp_tokens (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email      TEXT NOT NULL,
  otp_hash   TEXT NOT NULL,  -- bcrypt hash of OTP
  purpose    TEXT NOT NULL,  -- 'signup' | 'login' | 'reset_pin'
  expires_at TEXT NOT NULL,
  used       INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Sessions table
CREATE TABLE sessions (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,  -- SHA-256 hash of session token
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Login attempt tracking (rate limiting)
CREATE TABLE login_attempts (
  email      TEXT NOT NULL,
  attempted_at TEXT DEFAULT (datetime('now')),
  success    INTEGER DEFAULT 0
);
```

---

## SECTION 6 — DATABASE SCHEMA (Turso/libsql)

### 6.1 Reviews Schema

```sql
-- Reviews table
CREATE TABLE reviews (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tool_id         TEXT NOT NULL,  -- 'salary-calculator' | 'gst-calculator' | etc.
  user_id         TEXT REFERENCES users(id) ON DELETE SET NULL,
  display_name    TEXT NOT NULL,  -- snapshot of name at review time
  rating          INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment         TEXT,           -- optional, max 1000 chars
  is_hidden       INTEGER DEFAULT 0,
  is_pinned       INTEGER DEFAULT 0,
  helpful_count   INTEGER DEFAULT 0,
  admin_reply     TEXT,           -- null until admin responds
  admin_replied_at TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

-- Helpful votes (prevent double voting)
CREATE TABLE helpful_votes (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  review_id  TEXT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  ip_hash    TEXT,  -- fallback for non-logged-in users (SHA-256 of IP)
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(review_id, user_id)
);

-- Indexes for fast queries
CREATE INDEX idx_reviews_tool_id ON reviews(tool_id, is_hidden, created_at DESC);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_pinned  ON reviews(tool_id, is_pinned) WHERE is_pinned = 1;

-- Aggregate ratings view (computed on read — always fresh)
CREATE VIEW tool_ratings AS
SELECT
  tool_id,
  COUNT(*)                                          AS total_ratings,
  ROUND(AVG(CAST(rating AS FLOAT)), 1)              AS average_rating,
  SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END)       AS five_star,
  SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END)       AS four_star,
  SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END)       AS three_star,
  SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END)       AS two_star,
  SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END)       AS one_star
FROM reviews
WHERE is_hidden = 0
GROUP BY tool_id;
```

### 6.2 API Layer (Cloudflare Workers — Serverless)

Since Turso needs a server-side caller for auth (never expose DB credentials to browser), use **Cloudflare Workers** (free tier: 100,000 requests/day) as a thin API layer. This keeps the architecture serverless and free.

```
Workers endpoints:
POST /api/auth/send-otp        — generate + email OTP
POST /api/auth/verify-otp      — verify OTP, return session token
POST /api/auth/set-pin         — hash + store PIN
POST /api/auth/login           — verify PIN, return session token
POST /api/auth/logout          — invalidate session
GET  /api/reviews/:toolId      — fetch reviews (paginated, sorted)
POST /api/reviews              — submit new review (auth required)
POST /api/reviews/:id/helpful  — mark helpful (auth or IP-based)
GET  /api/ratings/:toolId      — get aggregate rating for JSON-LD schema
PATCH /api/admin/reviews/:id   — admin: reply/hide/pin (admin auth required)
DELETE /api/admin/reviews/:id  — admin: delete (admin auth required)
GET  /api/admin/dashboard      — admin: all tools summary
```

---

## SECTION 7 — TOOL 1: INDIA SALARY CALCULATOR

### 7.1 Page Specification
```
URL:        /salary-calculator
Title:      India Salary Calculator — CTC to In-Hand | New vs Old Tax Regime FY 2025-26
H1:         India Salary Calculator — CTC to In-Hand (FY 2025-26)
Description: Calculate your exact monthly in-hand salary from CTC. Compare New vs Old Tax 
             Regime instantly. Updated for Union Budget 2025. Free, accurate, no signup.
Keywords:   salary calculator india, ctc to in hand calculator, new tax regime calculator 
            2025, in hand salary calculator, how much tax on 10 lakh salary
Canonical:  https://tools.aksharatech.com/salary-calculator
OG Image:   /og/salary-calculator.png (1200×630 — shows tool screenshot with brand colors)
```

### 7.2 Layout — Viewport Fit Design
```
Desktop (≥1100px):
┌─────────────────────────────────────────────────────┐
│  HEADER (64px sticky)                               │
├──────────────────────┬──────────────────────────────┤
│  INPUTS PANEL        │  RESULTS PANEL               │
│  (420px fixed)       │  (remaining width)           │
│                      │                              │
│  Annual CTC ₹        │  ┌──────────────────────┐   │
│  [slider + input]    │  │  Monthly In-Hand      │   │
│                      │  │  ₹ 87,432  /month     │   │
│  Basic Salary %      │  │  [count-up animation] │   │
│  [slider]            │  └──────────────────────┘   │
│                      │                              │
│  City Type           │  New vs Old Regime           │
│  [Metro | Non-Metro] │  ┌─────────┬────────────┐   │
│                      │  │ New     │ Old        │   │
│  Rent Paid ₹/yr      │  │ ₹87,432 │ ₹83,210   │   │
│  [input]             │  │ ✓ SAVE  │            │   │
│                      │  │ ₹50,664 │            │   │
│  Professional Tax    │  └─────────┴────────────┘   │
│  [input]             │                              │
│                      │  Breakup Accordion           │
│  80C Deductions      │  [Gross → Deductions → Tax]  │
│  [slider — old only] │                              │
│                      │  ─────────────────────────  │
│  [New | Old] toggle  │  Trust Banner                │
│                      │  "Budget 2025 | FY 2025-26" │
└──────────────────────┴──────────────────────────────┘
│  REVIEWS SECTION                                    │
│  FAQ SECTION                                        │
│  FOOTER                                             │
└─────────────────────────────────────────────────────┘

Mobile (<768px): Single column — inputs top, results below
                 All inputs + results visible without scrolling
                 Achieved by: compact input heights (40px), smaller fonts,
                 results show only primary metric + regime comparison
                 Full breakup behind "Show details" expand
```

### 7.3 Input Fields
```
Field                  Type              Default         Range / Options
─────────────────────────────────────────────────────────────────────────
Annual CTC (₹)         Number + Slider   10,00,000       1L – 5Cr
Basic Salary %         Slider            40%             30% – 60%
HRA %                  Slider (auto)     50% metro       40%/50% auto
City Type              Toggle            Metro           Metro / Non-Metro
Actual Rent Paid (₹)   Number            0               0 – 30L
Professional Tax (₹/mo)Number            200             0 – 2,500
80C Deductions (₹)     Slider            1,50,000        0 – 1,50,000 (old only)
80D Health Insurance   Number            25,000          0 – 1,00,000 (old only)
NPS 80CCD(1B) (₹)      Number            0               0 – 50,000 (old only)
Employer PF            Toggle            Yes             Yes / No
Tax Regime             Toggle            New             New / Old
Age Bracket            Dropdown          < 60            < 60 / 60–79 / 80+
```
*Old regime fields (80C, 80D, NPS) must visually grey-out and zero when New regime selected*

### 7.4 Calculation Engine — src/tools/SalaryCalculator/salaryEngine.js

**All constants sourced from taxConfig.js — NEVER hardcode in this file.**

```javascript
// taxConfig.js — exact values for FY 2025-26 (AY 2026-27) — Union Budget 2025
export const TAX_CONFIG = {
  FY: '2025-26',
  AY: '2026-27',
  BUDGET_YEAR: 2025,
  LAST_VERIFIED: '2026-04-01',

  // Standard Deduction
  STD_DEDUCTION_NEW: 75000,   // Section 16(ia) — increased from 50K in Budget 2025
  STD_DEDUCTION_OLD: 50000,   // Section 16(ia) — unchanged

  // Section 87A Rebate
  REBATE_NEW_LIMIT: 1200000,  // ₹12,00,000 — taxable income threshold (new regime)
  REBATE_NEW_MAX:   60000,    // ₹60,000 — max rebate (up from ₹25,000)
  REBATE_OLD_LIMIT: 500000,   // ₹5,00,000 — taxable income threshold (old regime)
  REBATE_OLD_MAX:   12500,    // ₹12,500 — unchanged

  // Marginal Relief threshold (new regime only)
  MARGINAL_RELIEF_UPPER: 1275000, // ₹12,75,000 — above this, no marginal relief

  // PF limits (EPF Act 1952, Section 6)
  PF_EMPLOYEE_CAP_ANNUAL: 21600,  // 12% of ₹15,000/mo statutory wage ceiling
  PF_EMPLOYER_CAP_ANNUAL: 21600,

  // Gratuity (Payment of Gratuity Act 1972)
  GRATUITY_NUMERATOR: 15,
  GRATUITY_DENOMINATOR: 312,     // = 26 working days × 12 months

  // HRA % (Section 10(13A))
  HRA_METRO_PCT:    0.50,
  HRA_NONMETRO_PCT: 0.40,
  HRA_BASIC_FLOOR:  0.10,        // 10% of basic deducted from rent paid

  // Cess (both regimes)
  CESS_RATE: 0.04,               // 4% Health & Education Cess — unchanged since 2018

  // New Regime Tax Slabs (Section 115BAC, Finance Act 2025)
  // [lowerLimit, upperLimit, rate] — upperLimit null means no ceiling
  NEW_REGIME_SLABS: [
    [0,        400000,   0.00],
    [400000,   800000,   0.05],
    [800000,   1200000,  0.10],
    [1200000,  1600000,  0.15],
    [1600000,  2000000,  0.20],
    [2000000,  2400000,  0.25],
    [2400000,  null,     0.30],
  ],

  // Old Regime Tax Slabs
  OLD_REGIME_SLABS: {
    BELOW_60: [
      [0,       250000,  0.00],
      [250000,  500000,  0.05],
      [500000,  1000000, 0.20],
      [1000000, null,    0.30],
    ],
    SENIOR: [       // 60–79 years — basic exemption ₹3L
      [0,       300000,  0.00],
      [300000,  500000,  0.05],
      [500000,  1000000, 0.20],
      [1000000, null,    0.30],
    ],
    SUPER_SENIOR: [ // 80+ years — basic exemption ₹5L, no 87A rebate
      [0,       500000,  0.00],
      [500000,  1000000, 0.20],
      [1000000, null,    0.30],
    ],
  },

  // Surcharge rates (both regimes — old regime has 37% max, new regime capped at 25%)
  SURCHARGE_SLABS_NEW: [
    [0,          5000000,   0.00],
    [5000000,    10000000,  0.10],
    [10000000,   20000000,  0.15],
    [20000000,   null,      0.25], // New regime capped at 25%
  ],
  SURCHARGE_SLABS_OLD: [
    [0,          5000000,   0.00],
    [5000000,    10000000,  0.10],
    [10000000,   20000000,  0.15],
    [20000000,   50000000,  0.25],
    [50000000,   null,      0.37], // Old regime: 37% above ₹5Cr
  ],
};
```

**Calculation functions — exact logic:**

```
calculateSalaryBreakup(ctc, basicPct, hraPct, cityType, rentPaid,
                        professionalTax, deductions80C, deductions80D,
                        nps80CCD, employerPF, regime, ageBracket)

Returns: {
  gross: { basic, hra, specialAllowance, gratuity, employerPF },
  deductions: { employeePF, professionalTaxAnnual, standardDeduction,
                hraExempt, total80C, total80D, nps },
  taxable: { grossTaxable, netTaxable },
  tax: { beforeRebate, rebate, afterRebate, surcharge, cess, total },
  takeHome: { annual, monthly },
  comparison: { new: {...}, old: {...}, betterRegime, saving }
}

STEP 1 — Gross breakup:
  basic               = ctc × basicPct
  hra                 = basic × hraPct
  gratuity            = basic × 15/312
  employerPFAmount    = employerPF ? min(basic × 0.12, PF_EMPLOYER_CAP) : 0
  specialAllowance    = ctc − basic − hra − employerPFAmount − gratuity

STEP 2 — HRA Exemption (old regime only):
  hraReceived         = hra
  rentMinusFloor      = max(0, rentPaid − basic × 0.10)
  metroLimit          = basic × (cityType === 'metro' ? 0.50 : 0.40)
  hraExempt           = min(hraReceived, rentMinusFloor, metroLimit)
  NOTE: if rentPaid === 0, hraExempt = 0 (no rent = no exemption)

STEP 3 — Standard deduction:
  stdDed = regime === 'new' ? 75000 : 50000

STEP 4 — Employee PF:
  employeePF = min(basic × 0.12, PF_EMPLOYEE_CAP)

STEP 5 — Net taxable income:
  grossTaxable = ctc − employerPFAmount − gratuity
  if regime === 'new':
    netTaxable = max(0, grossTaxable − stdDed)
    // No HRA, no 80C, no 80D, no NPS deductions
  if regime === 'old':
    capped80C  = min(deductions80C, 150000)
    // Note: employeePF counts within 80C cap
    netTaxable = max(0, grossTaxable − hraExempt − stdDed − capped80C
                        − deductions80D − nps80CCD)

STEP 6 — Tax on slab:
  function calcSlabTax(income, slabs):
    tax = 0
    for each [lower, upper, rate] in slabs:
      upper = upper ?? Infinity
      if income > lower:
        tax += min(income, upper) − lower) × rate
    return tax

STEP 7 — Section 87A Rebate:
  if regime === 'new':
    if netTaxable <= 1200000:
      rebate = min(slabTax, 60000)
    elif netTaxable <= 1275000:  // Marginal relief zone
      excessIncome = netTaxable − 1200000
      normalTax    = slabTax − 60000  // tax without rebate
      rebate       = max(0, normalTax − excessIncome)  // marginal relief
    else:
      rebate = 0
  if regime === 'old':
    if ageBracket === '80+':  // Super seniors ineligible for 87A
      rebate = 0
    elif netTaxable <= 500000:
      rebate = min(slabTax, 12500)
    else:
      rebate = 0

STEP 8 — Surcharge:
  taxAfterRebate = slabTax − rebate
  surchargeRate  = look up from SURCHARGE_SLABS (regime-specific)
  surcharge      = taxAfterRebate × surchargeRate
  // Apply marginal relief on surcharge too at each threshold

STEP 9 — Cess:
  cess     = (taxAfterRebate + surcharge) × 0.04
  totalTax = taxAfterRebate + surcharge + cess

STEP 10 — In-hand:
  annualDeductions  = employeePF + (professionalTax × 12) + totalTax
  annualTakeHome    = ctc − employerPFAmount − gratuity − annualDeductions
  monthlyInHand     = Math.round(annualTakeHome / 12)
  
ROUNDING: All intermediate values: full float precision
          All displayed outputs: Math.round() to nearest rupee
```

### 7.5 Verified Test Cases

| CTC | Regime | Age | Rent | 80C | Expected Monthly In-Hand | Verify Against |
|-----|--------|-----|------|-----|--------------------------|----------------|
| ₹6,00,000 | New | <60 | 0 | — | ~₹44,000 | Tax = ₹0 (87A full rebate) |
| ₹10,00,000 | New | <60 | 0 | — | ~₹72,500 | Tax ~₹75,400 after cess |
| ₹12,00,000 | New | <60 | 0 | — | ~₹88,000 | Tax = ₹0 (87A ₹60K rebate) |
| ₹12,10,000 | New | <60 | 0 | — | ~₹89,000 | Marginal relief applies |
| ₹15,00,000 | New | <60 | 0 | — | ~₹1,08,000 | Tax ~₹1,01,400 incl cess |
| ₹15,00,000 | Old | <60 | 2,40,000 | 1,50,000 | ~₹1,04,500 | Compare regimes |
| ₹25,00,000 | New | <60 | 0 | — | ~₹1,74,000 | 30% slab active |
| ₹60,00,000 | Old | <60 | 0 | 1,50,000 | — | 10% surcharge applies |

*Test against: incometax.gov.in tax calculator + ClearTax.in — tolerance ±₹100*

### 7.6 Output Display

```
Primary Result:
  "Monthly In-Hand Salary" — large, count-up animation
  ₹ [number in var(--font-mono) 48px]  /month
  
  Copy button — top right of card

Regime Comparison (side by side):
  New Regime card | Old Regime card
  Monthly in-hand | Monthly in-hand
  Annual tax      | Annual tax
  Winner highlighted in green with "Save ₹X/year" badge

Salary Breakup Accordion (3 sections, collapsed by default):
  "Your CTC Breakup"       → Basic | HRA | Special Allowance | Gratuity | Employer PF
  "Deductions Applied"     → Employee PF | Prof Tax | Std Ded | HRA Exempt | 80C | 80D | NPS
  "Tax Calculation"        → Gross Taxable | Net Taxable | Slab Tax | Rebate | Surcharge | Cess
  
  Each accordion shows monthly and annual figures

Trust Banner (always visible):
  "Updated for Union Budget 2025 | FY 2025-26 (AY 2026-27)
   New Tax Regime is the default from April 2025.
   Verify at incometax.gov.in for official filing."
```

### 7.7 SEO Content Block

```markdown
## How is CTC different from In-Hand Salary?
(150 words — explains Basic, HRA, PF, Gratuity deductions — primary FAQ)

## New Tax Regime vs Old Tax Regime — Which is better in 2025?
(200 words — Budget 2025 changes, who benefits from each, with examples)

## How is HRA exemption calculated?
(150 words — three-way min formula explained simply)

## What is the standard deduction for salaried employees in FY 2025-26?
(80 words — ₹75,000 new regime, ₹50,000 old regime)

## How much tax do I pay on ₹10 lakh / ₹15 lakh / ₹20 lakh salary?
(200 words — concrete examples for common salary points)

## Is income up to ₹12 lakh really tax-free in 2025?
(100 words — Section 87A rebate explanation)
```

*FAQ schema JSON-LD injected for all above — targets featured snippet positions*

---

## SECTION 8 — TOOL 2: GST CALCULATOR + INVOICE GENERATOR

### 8.1 Page Specification
```
URL:        /gst-calculator
Title:      GST Calculator & Invoice Generator | CGST SGST IGST Split — Free 2025
H1:         GST Calculator — Instant CGST, SGST & IGST Split
Description: Calculate GST instantly for any amount. Generate professional GST invoices 
             with PDF download. CGST, SGST, IGST split. Free, no signup, updated Dec 2024.
Keywords:   gst calculator, gst invoice generator online free, cgst sgst calculator,
            gst inclusive exclusive calculator, gst invoice format india
```

### 8.2 Layout
Two tabs on same page — "GST Calculator" | "Invoice Generator"

**Tab 1 — GST Calculator:**
```
Left (inputs):                Right (results):
Amount ₹ [input]              Base Amount:    ₹ 1,000.00
                              CGST (9%):      ₹    90.00
Amount Type                   SGST (9%):      ₹    90.00
[Exclusive | Inclusive]       ─────────────────────────
                              Total:          ₹ 1,180.00
GST Rate
[0%][5%][12%][18%][28%]      [Copy All]  [Download PDF]

Transaction Type
[Intra-state | Inter-state]   Rate badge: "18% GST Applied"
```

### 8.3 GST Formulas — Exact

```
GST Exclusive (add GST on top):
  gstAmount = Math.round(baseAmount × rate / 100 × 100) / 100
  total     = baseAmount + gstAmount
  Intra: cgst = sgst = Math.floor(gstAmount × 100 / 2) / 100
         if cgst + sgst < gstAmount: sgst += gstAmount - (cgst + sgst)  // absorb paise
  Inter: igst = gstAmount

GST Inclusive (extract from total):
  base      = Math.round(total / (1 + rate/100) × 100) / 100
  gstAmount = Math.round((total - base) × 100) / 100
  Verify:   |base + gstAmount - total| < 0.01
  
GST Rates (CGST Act 2017 + GST Council through Dec 2024):
  0%: Food grains, fresh vegetables, healthcare, education services
  5%: Household essentials, non-AC restaurants, transport services
  12%: Processed foods, business-class air travel, construction works
  18%: IT services, professional services, AC restaurants, electronics
  28%: Luxury goods, tobacco, automobiles, aerated beverages
```

### 8.4 Invoice Generator Fields

```
Seller Details (persisted to localStorage — auto-filled on return):
  Business Name, GSTIN (15 char), Address, City, State, PIN, Phone, Email
  Bank: Account No, IFSC, Bank Name, Branch (optional)

Buyer Details:
  Name, GSTIN (optional), Address, City, State, PIN

Invoice Meta:
  Invoice No (auto-increment, editable), Date, Due Date
  Place of Supply (state → determines IGST vs CGST+SGST)

Line Items (dynamic, max 20 rows):
  Description | HSN/SAC | Qty | Unit | Rate (₹) | GST % | Amount | GST | Total

Totals:
  Subtotal | Total CGST | Total SGST | Total IGST | Discount | Grand Total
  Amount in Words (Indian system — crores, lakhs — see function spec below)

numberToWords(amount):
  Must handle: crores, lakhs, thousands, hundreds — Indian numbering
  Test cases:
    1,00,000     → "Rupees One Lakh Only"
    11,11,111    → "Rupees Eleven Lakhs Eleven Thousand One Hundred and Eleven Only"
    1,00,00,000  → "Rupees One Crore Only"
    ₹2,553.20    → "Rupees Two Thousand Five Hundred and Fifty-Three and Twenty Paise Only"
    ₹0.50        → "Rupees Zero and Fifty Paise Only"

PDF (jsPDF + autoTable, client-side, no server):
  A4 portrait, professional letterhead style
  Colors match tool branding (--clr-primary header bar)
  Logo area: if user uploads logo (base64 localStorage) — show, else placeholder
  Filename: Invoice_{InvoiceNo}_{BuyerName}_{YYYY-MM-DD}.pdf
  NO data sent to any server — 100% client-side
```

---

## SECTION 9 — TOOL 3: SIP RETURN CALCULATOR

### 9.1 Page Specification
```
URL:        /sip-calculator
Title:      SIP Calculator — Returns with Step-Up & Inflation Adjusted | Free 2025
H1:         SIP Return Calculator — Monthly SIP Growth Estimator
Keywords:   sip calculator, step up sip calculator, sip return calculator india,
            mutual fund sip calculator, sip maturity calculator
```

### 9.2 Inputs
```
Monthly SIP (₹)        Slider + Number    5,000        500 – 5,00,000
Expected Return (% pa) Slider             12%          1% – 30% (step 0.5)
Time Period (years)     Slider             10           1 – 40
Step-Up % per year      Slider             0%           0% – 50%
Expected Inflation (%)  Slider             6%           0% – 15%
```

### 9.3 Calculation Engine — Exact Loop (No Approximation)

```javascript
// Standard SIP (no step-up):
function calcSIP(monthlyAmount, annualRate, years) {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  // Beginning of period annuity (SIP invested at START of each month)
  const fv = monthlyAmount * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const invested = monthlyAmount * n;
  return { fv: Math.round(fv), invested, returns: Math.round(fv - invested) };
}

// Step-Up SIP — EXACT month-by-month loop (mandatory — no closed form):
function calcStepUpSIP(monthlyAmount, annualRate, years, stepUpPct) {
  const r = annualRate / 12 / 100;
  let corpus = 0;
  let currentSIP = monthlyAmount;
  let totalInvested = 0;
  const n = years * 12;

  for (let month = 1; month <= n; month++) {
    corpus = (corpus + currentSIP) * (1 + r);
    totalInvested += currentSIP;
    // Increase SIP at the END of each completed year (not month 0)
    if (month % 12 === 0 && month < n) {
      currentSIP = currentSIP * (1 + stepUpPct / 100);
    }
  }
  return {
    fv: Math.round(corpus),
    invested: Math.round(totalInvested),
    returns: Math.round(corpus - totalInvested)
  };
}

// Inflation-adjusted real value:
function realValue(nominalFV, inflationRate, years) {
  return Math.round(nominalFV / Math.pow(1 + inflationRate / 100, years));
}
```

### 9.4 Outputs
- Primary: Total Corpus | Invested Amount | Estimated Returns (3-card grid)
- Real Value: "Worth ₹X in today's money" (inflation-adjusted) — subtle label
- Year-by-year chart: Area chart — Total Invested (solid) vs Corpus (gradient above)
- SIP schedule: collapsible table — Year | Yearly Investment | Total Invested | Corpus

### 9.5 Test Cases
| Monthly | Rate | Years | Step-Up | Expected Corpus | Invested |
|---------|------|-------|---------|-----------------|----------|
| ₹5,000 | 12% | 10 | 0% | ₹11,61,695 | ₹6,00,000 |
| ₹10,000 | 15% | 20 | 0% | ₹1,51,59,756 | ₹24,00,000 |
| ₹5,000 | 12% | 10 | 10%/yr | ~₹18,30,000 | ~₹9,56,000 |

*Cross-verify against Groww SIP calculator and ET Money step-up SIP calculator*

---

## SECTION 10 — TOOL 4: EMI CALCULATOR

### 10.1 Page Specification
```
URL:        /emi-calculator
Title:      EMI Calculator — Home Loan, Car Loan, Personal Loan | India 2025
H1:         EMI Calculator — Reducing Balance Method
Keywords:   emi calculator, home loan emi calculator india, car loan emi calculator,
            personal loan emi calculator, loan emi calculator 2025
```

### 10.2 Inputs
```
Loan Amount (₹)        Slider + Number    25,00,000    10,000 – 10Cr
Interest Rate (% pa)   Slider             8.5%         1% – 30% (step 0.1)
Loan Tenure            Slider             20 years     1 – 30 years (or months toggle)
Loan Type Tabs         Tabs               Home         Home / Car / Personal
                       (changes default rate: Home 8.5%, Car 9.5%, Personal 12%)
```

### 10.3 Calculation Engine — Reducing Balance ONLY

```javascript
function calcEMI(principal, annualRate, tenureMonths) {
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  
  if (r === 0) return { emi: Math.round(principal / n), interest: 0, total: principal };
  
  const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const total = Math.round(emi * n);
  const interest = total - principal;
  
  return {
    emi: Math.round(emi * 100) / 100,
    totalInterest: interest,
    totalPayment: total
  };
}

// Amortisation schedule (month by month):
function buildAmortisation(principal, annualRate, tenureMonths) {
  const r = annualRate / 12 / 100;
  const emi = calcEMI(principal, annualRate, tenureMonths).emi;
  const schedule = [];
  let balance = principal;

  for (let m = 1; m <= tenureMonths; m++) {
    const interestComp = Math.round(balance * r * 100) / 100;
    const principalComp = m < tenureMonths
      ? Math.round((emi - interestComp) * 100) / 100
      : balance; // Last EMI clears exact balance
    balance = Math.round((balance - principalComp) * 100) / 100;
    schedule.push({ month: m, emi, principal: principalComp, interest: interestComp, balance });
  }
  return schedule;
}
```

### 10.4 Unique Feature — Comparison Mode
Toggle "Compare Loans" → adds second column of inputs side by side.  
Both EMIs, total interests, and donut charts shown simultaneously.  
"Loan A saves you ₹X vs Loan B" highlighted in green.

### 10.5 Test Cases
| Loan | Rate | Tenure | Expected EMI | Total Interest |
|------|------|--------|--------------|----------------|
| ₹10,00,000 | 10% | 5 yrs | ₹21,247 | ₹2,74,820 |
| ₹30,00,000 | 8.5% | 20 yrs | ₹26,035 | ₹32,48,400 |
| ₹5,00,000 | 12% | 3 yrs | ₹16,607 | ₹97,852 |

*Verify against SBI Home Loan calculator + HDFC Bank EMI calculator — tolerance ±₹1*

---

## SECTION 11 — TOOL 5: TDEE + MACRO CALCULATOR

### 11.1 Page Specification
```
URL:        /tdee-calculator
Title:      TDEE & Macro Calculator | Daily Calories, Protein, Carbs, Fat — Free 2025
H1:         TDEE Calculator — Daily Calorie & Macro Planner
Keywords:   tdee calculator, macro calculator india, calorie calculator,
            how many calories should i eat, protein requirement calculator india
```

### 11.2 Inputs
```
Age              Number         30          10 – 80
Gender           Toggle         Male        Male / Female
Height           Slider+Input   170 cm      100–220cm (ft/in toggle converts internally)
Weight           Slider+Input   70 kg       30–200kg (lbs toggle converts internally)
Activity Level   Button group   Moderate    5 options (see below)
Goal             3-way toggle   Maintain    Lose Weight / Maintain / Gain Muscle
```

### 11.3 Calculation Engine

```javascript
// Mifflin-St Jeor Equation (1990) — most accurate for general population
// Source: Mifflin MD et al., Am J Clin Nutr 1990;51(2):241-7 (PMID 2305711)
function calcBMR(weightKg, heightCm, age, gender) {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  return gender === 'male' ? base + 5 : base - 161;
}

// Activity multipliers (Harris-Benedict activity factors)
const ACTIVITY_MULTIPLIERS = {
  sedentary:  1.2,    // Little/no exercise, desk job
  light:      1.375,  // Light exercise 1-3 days/week
  moderate:   1.55,   // Moderate exercise 3-5 days/week
  active:     1.725,  // Hard exercise 6-7 days/week
  veryActive: 1.9,    // Very hard exercise, physical job
};

function calcTDEE(bmr, activityLevel) {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

// Goal-based calorie targets
const GOAL_ADJUSTMENTS = {
  lose:     -500,  // 0.5 kg/week deficit (Hall et al., Lancet 2011)
  maintain: 0,
  gain:     +300,  // Lean bulk surplus
};

const CALORIE_FLOORS = { male: 1500, female: 1200 }; // Safety minimum

// Macro splits (evidence-based — Academy of Nutrition and Dietetics)
const MACRO_SPLITS = {
  lose:     { protein: 0.35, carbs: 0.40, fat: 0.25 },
  maintain: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  gain:     { protein: 0.30, carbs: 0.50, fat: 0.20 },
};

// Caloric density: protein 4 kcal/g, carbs 4 kcal/g, fat 9 kcal/g
function calcMacros(targetCalories, goal) {
  const split = MACRO_SPLITS[goal];
  return {
    protein: Math.round(targetCalories * split.protein / 4),
    carbs:   Math.round(targetCalories * split.carbs   / 4),
    fat:     Math.round(targetCalories * split.fat     / 9),
  };
}

// BMI (WHO classification)
function calcBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return Math.round(weightKg / (heightM * heightM) * 10) / 10;
}

// BMI categories: <18.5 Underweight | 18.5-24.9 Normal | 25-29.9 Overweight | ≥30 Obese

// Ideal weight range (Hamwi formula)
function calcIdealWeight(heightCm, gender) {
  const heightIn = heightCm / 2.54;
  const inchesOver5ft = Math.max(0, heightIn - 60);
  const base = gender === 'male'
    ? 48 + (2.7 * inchesOver5ft)
    : 45.5 + (2.2 * inchesOver5ft);
  return { min: Math.round(base * 0.9), max: Math.round(base * 1.1) };
}

// Water intake: WHO standard 35ml/kg body weight
function calcWater(weightKg) {
  return Math.round(weightKg * 35); // ml/day
}
```

### 11.4 Outputs
- Primary: TDEE (maintenance calories) — large
- Goal target: calories/day with goal adjustment
- Macro donut chart: protein/carbs/fat (pure SVG — no Chart.js for this)
- Macro grams: Xg protein | Xg carbs | Xg fat | Total Xcal
- BMI bar: visual scale from Underweight to Obese with marker
- Ideal weight range: "Your ideal weight: 65–79 kg"
- Water: "Recommended water intake: 2,450 ml/day"

### 11.5 Test Cases
| Gender | Age | Weight | Height | Activity | Expected BMR | Expected TDEE |
|--------|-----|--------|--------|----------|--------------|---------------|
| Male | 30 | 70kg | 175cm | Moderate | 1,680 kcal | 2,604 kcal |
| Female | 28 | 60kg | 162cm | Moderate | 1,398 kcal | 2,167 kcal |
| Male | 45 | 90kg | 180cm | Sedentary | 1,925 kcal | 2,310 kcal |

---

## SECTION 12 — RATINGS, REVIEWS & COMMENTS SYSTEM

### 12.1 Rules
- **No login required to VIEW reviews**
- **Login required to WRITE a review or comment**
- **One review per user per tool** (enforced by DB unique constraint)
- **Admin can reply, moderate, pin — from /admin panel**
- **All reviews visible publicly** unless admin hides them

### 12.2 Rating Summary Component
```
Left:  Large average score (e.g., 4.8) in 40px bold --clr-primary
       5 SVG stars (filled/half/empty proportional to average)
       "Based on 1,247 ratings" — 12px muted

Right: Distribution bars — 5★ through 1★
       Each row: star label | progress bar | count
       Bar width = count/total × 100%
       Clicking a row filters the review list to that rating
```

### 12.3 Write a Review — State Machine
```
State A (not logged in, idle):
  Show: "Rate this tool" + 5 empty star buttons
  On star click → redirect to login/signup with returnUrl

State B (logged in, no review yet):
  Star picker (5 large stars, 44×44px, amber on select)
  Display name: pre-filled from account (editable for this review)
  Comment: optional textarea, 4 rows, 1000 char limit + counter
  Submit: disabled until star selected + name filled

State C (review submitted):
  Thank-you message
  "Edit your review" link (updates existing record, does not create duplicate)

Validation:
  Strip HTML: comment.replace(/<[^>]*>/g, '')
  Max 3 URLs in comment — reject if more (spam guard)
  Rate limit: 1 review per user per tool (DB constraint)
```

### 12.4 Review Card
```
Row 1: ★★★★★ | Display Name | "2 days ago" (relative, exact date on hover)
Row 2: Comment text (300 chars shown → "Read more" expands)
Row 3: Admin reply (if exists) — left border 3px --clr-primary
       Header: "AT" avatar circle | "Akshara Technologies" | "Official Response" badge | date
       Reply text below
Row 4: "Helpful? Yes (12)" button — disabled after voting once (tracked per session in DB)
```

### 12.5 Admin Panel — /admin

```
Auth: Admin email + PIN (same PIN system as users, but admin account is seeded)
      Admin account created in DB seed — never via public signup flow

Layout:
  Left sidebar: tool selector tabs with pending badge counts
  Main area: review table with columns:
    Name | Rating | Comment preview | Date | Status | Actions

Status badges: Pending (amber) | Replied (green) | Hidden (gray) | Pinned (blue)

Actions per review:
  Reply    — inline textarea, auto-save draft, 2000 char limit
  Edit Reply — pre-fill existing, overwrite
  Hide/Unhide — sets is_hidden
  Pin/Unpin — sets is_pinned (max 3 pinned per tool)
  Delete  — two-step confirmation, permanent

Admin metrics strip (top):
  Per tool: Total Reviews | Avg Rating | Pending Replies | Last Review date

Reply submits via PATCH /api/admin/reviews/:id
Reply immediately reflected on public page
```

### 12.6 JSON-LD AggregateRating Schema (per tool)
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "India Salary Calculator — CTC to In-Hand",
  "url": "https://tools.aksharatech.com/salary-calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": 1247,
    "bestRating": "5",
    "worstRating": "1"
  }
}
```
*Only render schema when reviewCount >= 5. Dynamic — fetched from /api/ratings/:toolId on mount.*

---

## SECTION 13 — SEO STANDARDS

### 13.1 Per-Tool Requirements (applied by SEO agent to all 5 tools)
```
<title>        Unique, 55–60 chars, primary keyword first
<description>  155 chars max, includes keyword naturally, includes "Free" and current year
<h1>           One per page, contains primary keyword, matches intent
<canonical>    Exact tool URL
<og:image>     Custom 1200×630px screenshot with brand overlay
JSON-LD        WebApplication + AggregateRating + FAQPage schemas
Sitemap        Auto-generated at build, all 5 tools + static pages included
robots.txt     Allow all crawlers, point to sitemap
Internal links Each tool links to 2 related tools ("You might also use: SIP Calculator")
```

### 13.2 FAQ Schema — Required Q&A per tool

**Salary Calculator (6 FAQs):**
1. How is monthly in-hand salary calculated from CTC?
2. What is the new tax regime in FY 2025-26?
3. How much tax do I pay on ₹10 lakh salary in India?
4. Is income up to ₹12 lakh tax-free in 2025?
5. What is the difference between new and old tax regime?
6. How is HRA exemption calculated?

**GST Calculator (5 FAQs):**
1. What is the difference between CGST, SGST, and IGST?
2. How do I calculate GST on a price?
3. How to extract GST from an inclusive price?
4. What are the current GST rates in India 2024?
5. How to generate a GST invoice?

**SIP Calculator (5 FAQs):**
1. How is SIP return calculated?
2. What is step-up SIP?
3. Is SIP return guaranteed?
4. How much will ₹5,000 SIP grow in 10 years?
5. What is the best SIP amount for beginners?

**EMI Calculator (5 FAQs):**
1. How is EMI calculated?
2. What is the reducing balance method?
3. How to reduce home loan EMI?
4. What happens if I pay extra EMI?
5. What is a good EMI to salary ratio?

**TDEE Calculator (5 FAQs):**
1. What is TDEE and how is it calculated?
2. How many calories should I eat to lose weight?
3. What is the Mifflin-St Jeor equation?
4. How much protein do I need per day?
5. How many calories should an Indian person eat per day?

### 13.3 AdSense Ad Placement
```
Tool page ad slots (2 manual + auto-ads enabled):
  Slot 1: Below the FAQ section header, above FAQ content (728×90 leaderboard desktop / 320×50 mobile)
  Slot 2: Below FAQ section, above Reviews section (responsive unit)
  Auto-ads: enabled globally — Google fills remaining slots intelligently

Pages with AdSense:
  All 5 tool pages ✓
  Home (tools directory) ✓
  About ✓
  Privacy Policy ✗ (excluded — AdSense policy)
  Admin ✗ (excluded — internal page)
```

---

## SECTION 14 — STATIC PAGES (required for AdSense approval)

### 14.1 Home Page (Tools Directory)
```
URL: /
Title: Free Online Calculators India — Salary, GST, SIP, EMI, TDEE | Akshara Tools
H1: Free Financial & Health Calculators for India

Hero: "Trusted by thousands of Indians for accurate, instant calculations"
      Tagline: "Updated for Budget 2025 · No signup required · 100% free"

Tools grid (5 cards):
  Each card: tool icon | tool name | one-line description | "Open Calculator →"
  Cards: Salary Calculator | GST Calculator | SIP Calculator | EMI Calculator | TDEE Calculator

Trust strip below grid:
  "All formulas verified as per Union Budget 2025 | FY 2025-26"
  "No signup to use · No ads on results · No data stored"
  [Google rating badge when available]
```

### 14.2 Privacy Policy
```
URL: /privacy-policy
Must cover: cookies, analytics (GA4), AdSense data collection, no sale of data,
            Turso database (what's stored — only review data, no financial inputs),
            GDPR-style rights (access, delete account)
Last updated: show date
```

### 14.3 Terms of Use
```
URL: /terms-of-use
Must cover: tools for estimation only, not financial advice, verify with CA for filing,
            no liability for calculation errors, intellectual property, governing law (India)
```

### 14.4 About
```
URL: /about
Content: Akshara Technologies background, why these tools were built,
         commitment to accuracy, Budget 2025 verification process,
         link to aksharatech.com for consulting services
CTA: "Need custom SharePoint or automation solutions? Visit aksharatech.com →"
```

---

## SECTION 15 — ENVIRONMENT VARIABLES

```bash
# .env.example — developer copies to .env and fills values

# Turso Database
VITE_TURSO_DATABASE_URL=libsql://[database-name].turso.io
VITE_TURSO_AUTH_TOKEN=

# Resend (email OTP)
VITE_RESEND_API_KEY=

# Admin
VITE_ADMIN_PIN_HASH=   # bcrypt hash of admin 4-digit PIN
VITE_ADMIN_EMAIL=      # admin email for login

# Google Analytics
VITE_GA_MEASUREMENT_ID=

# Cloudflare (for Workers deployment)
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
```

---

## SECTION 16 — QUALITY ACCEPTANCE CRITERIA

**Before Task 032 (Final Handoff) can be marked complete, ALL of the following must pass:**

### 16.1 Calculation Accuracy
- [ ] All salary test cases pass within ±₹100 of incometax.gov.in
- [ ] All GST test cases: CGST + SGST = total GST within ₹0.01
- [ ] All SIP test cases match Groww calculator within ±₹500
- [ ] All EMI test cases match SBI calculator within ±₹1
- [ ] All TDEE test cases match calculator.net within ±5 kcal
- [ ] Vitest suite: 100% pass on all calculation engine tests

### 16.2 UI/UX
- [ ] Tool fully usable without scrolling on iPhone SE (375×667px)
- [ ] Tool fully usable without scrolling on iPad (768×1024px)
- [ ] Tool fully usable without scrolling on 1366×768 laptop
- [ ] All interactive elements ≥ 44×44px
- [ ] Dark mode: all text readable, no invisible elements
- [ ] Theme toggle persists across page reload
- [ ] Count-up animation fires on first load only

### 16.3 Performance
- [ ] Lighthouse Performance ≥ 95 on mobile (all 5 tools)
- [ ] FCP < 1.0s on simulated 4G connection
- [ ] No layout shift on load (CLS < 0.05)
- [ ] Each tool JS chunk < 80KB gzipped

### 16.4 SEO
- [ ] Each tool has unique title, description, canonical
- [ ] JSON-LD validates in Google Rich Results Test
- [ ] Sitemap includes all 5 tools + static pages
- [ ] robots.txt allows all crawlers, points to sitemap
- [ ] FAQ sections have correct FAQPage schema

### 16.5 Auth & Reviews
- [ ] Disposable email domains blocked on signup
- [ ] OTP expires after 10 minutes
- [ ] 5 wrong PIN attempts → 30-minute lockout
- [ ] One review per user per tool (DB constraint enforced)
- [ ] Admin panel inaccessible without correct PIN
- [ ] Admin reply appears on public page within 2 seconds of submit

### 16.6 AdSense Readiness
- [ ] Privacy Policy page live and complete
- [ ] Terms of Use page live and complete
- [ ] About page live with contact information
- [ ] No broken links (404) on any page
- [ ] Google Analytics 4 tracking confirmed in GA4 dashboard
- [ ] Mobile Friendly Test passes (search.google.com/test/mobile-friendly)

---

## SECTION 17 — README.md (for Sagar's local setup)

The ARCH agent must generate a README.md in the project root covering:

```markdown
# Akshara Tools — Local Development Setup

## Prerequisites
- Node.js 18+ (LTS)
- npm 9+
- Turso CLI (for DB management): npm install -g @libsql/cli

## Setup
1. Clone repo: git clone [repo-url]
2. Install: npm install
3. Copy env: cp .env.example .env
4. Fill .env values (Turso URL, auth token, Resend key)
5. Run DB migrations: npm run db:migrate
6. Start dev: npm run dev
7. Open: http://localhost:5173

## Test
npm run test          # runs all Vitest tests
npm run test:coverage # coverage report

## Build
npm run build         # production build
npm run preview       # preview production build locally

## Deploy (Sagar does this manually)
git push origin main  # triggers Cloudflare Pages auto-deploy

## Admin Panel
URL: http://localhost:5173/admin
PIN: [set in .env as VITE_ADMIN_EMAIL + VITE_ADMIN_PIN_HASH]

## Adding New Tax Year
Update ONLY: src/config/taxConfig.js
Change: FY, AY, BUDGET_YEAR, LAST_VERIFIED + any changed slab values
No other files need changing.
```

---

## SECTION 18 — TRUST & ACCURACY DISCLOSURES

Every tool page must display (always visible, never hidden):

```
Trust Banner Component:
"Calculations based on Union Budget 2025 | FY 2025-26 (AY 2026-27)
 Last verified: April 2025 | Source: Income Tax Act 1961
 For official tax filing, use the Income Tax e-filing portal."

"How we calculate" expandable:
  Plain-language explanation of formula used
  Legal section cited (e.g., "Section 10(13A), Income Tax Act 1961")
  "Report an error" link → opens GitHub issue or mailto:tools@aksharatech.com

Footer disclaimer:
"This tool provides estimates for planning purposes only and does not 
 constitute financial, tax, or investment advice. All results assume 
 Indian resident individual status. Consult a CA before filing returns."
```

---

*End of PRD — All sections must be implemented completely before handoff to Sagar for local testing.*

*CEO Agent: do not modify calculation formulas, tax constants, or database schema without explicit instruction from Sagar Savaliya.*
