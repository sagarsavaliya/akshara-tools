# PROJECT CONTEXT
# Filled by CEO Agent on project kickoff. Updated as project evolves.
# READ by: CEO Agent, all Department Heads
# DO NOT read full requirement doc after this file is populated.

---

## Project Identity
- **Project Name:** Akshara Tools Suite
- **Client / Product:** Akshara Internal
- **Type:** [ ] Client Project  [x] SaaS Product  [x] Internal Tool
- **Start Date:** 2026-04-26
- **Target Delivery:** 2026-05-05
- **Priority:** [x] Critical  [ ] High  [ ] Normal

---

## Project Summary (≤ 10 lines)
Build a fast, SEO-ready tools platform at tools.aksharatech.com for five calculators: Salary, GST, SIP, EMI, and TDEE.
Primary monetization is AdSense with strong technical SEO and static SPA deployment on Cloudflare Pages.
All business constants must be config-driven; no hardcoded tax/business values inside components.
Admin panel at `/admin` must manage reviews and moderation end-to-end.
Auth flow is email OTP + 4-digit PIN, with public read and authenticated write for reviews.

---

## Active Departments
- [x] Technical (CTO Agent)
- [x] Product & Design (CPO Agent)
- [ ] Sales (Sales Director)
- [x] Marketing (Marketing Director)
- [ ] Legal (Legal Agent)
- [ ] Data & Analytics (Data Analyst)

---

## Tech Stack for This Project
- **Frontend:** React 18 + Vite + React Router
- **Backend:** Cloudflare Workers API (serverless)
- **Database:** Turso (libsql / SQLite)
- **Cloud:** Cloudflare Pages + Cloudflare Workers
- **Search:** DB query + indexed filtering
- **Cache:** none (phase 1), optional edge cache later
- **Auth:** Custom OTP + PIN

---

## End Users Profile
- **Who uses this:** Indian users doing daily finance and health calculations
- **Primary devices:** [ ] Desktop  [ ] Mobile  [ ] Tablet  [x] All
- **Technical level:** [x] Non-technical  [ ] Semi-technical  [ ] Technical
- **Industry:** Consumer finance + health
- **Special needs:** Mobile-first, low friction, no signup for tool usage

---

## Key Modules / Features
1. Salary Calculator — CTC to in-hand, old/new tax regime compare
2. GST Calculator — inclusive/exclusive + invoice generation
3. SIP Calculator — step-up and inflation-adjusted projection
4. EMI Calculator — reducing balance and comparison mode
5. TDEE Calculator — calories, macros, BMI, hydration
6. Reviews + Admin Panel — moderation, pin/hide/reply/export
7. Auth system — OTP signup and 4-digit PIN login

---

## Performance Requirements
- Expected concurrent users: 500+
- Expected data volume: 100K+ reviews year 1
- Search dataset size: review tables per tool
- Special performance needs: sub-100ms local calculations and Lighthouse >=95 mobile

---

## Integration Points
- [External API / System 1]: [purpose]
- [External API / System 2]: [purpose]

---

## Critical Business Rules
1. Entire tool use path should fit viewport as much as possible across target devices.
2. No hardcoded tax/business constants inside tool components.
3. Salary tax constants are managed only in `src/config/taxConfig.js`.
4. Tool usage is public; login required only for posting reviews.
5. Admin panel must be protected and support moderation actions.
6. All output monetary values shown rounded.
7. Mobile numeric keyboard must be used for numeric inputs.
8. No production deployment without manual review.

---

## Requirement Document Location
- **File:** briefs/PRD.md
- **Status:** [x] Parsed by CEO Agent  [x] Task files generated  [x] Ready for development
- **Note:** Development should run by phased task files and status tracking.

---

## Key Decisions Log
[Linked to DECISIONS.md — see that file for full architecture decisions]

---
*Last updated by: CEO Agent | 2026-04-26*
