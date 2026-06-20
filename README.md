# 🧭 CarbonCompass

**Understand, track and reduce your personal carbon footprint — with AI-personalized insights.**

CarbonCompass is a web app that turns a person's everyday habits (how they
travel, power their home, eat and shop) into a clear monthly CO₂e number, shows
where it comes from, and recommends the **few actions that actually matter most
for that specific person** — ranked by how much CO₂e each would save *them*.

Built for the **Carbon Footprint Awareness Platform** challenge.

---

## 1. Chosen vertical

**Persona: the everyday urban individual.** Someone who wants to live more
sustainably but doesn't know *where they stand* or *which single change matters
most*. Generic "turn off lights" advice doesn't help them prioritize.

CarbonCompass is built around that persona: a fast, friendly, jargon-free
coach that meets the problem statement head-on — **understand → track → reduce,
through simple actions and personalized insights.**

## 2. Approach & logic

The core design decision is **separation of maths from language**:

- A pure, fully unit-tested **emission engine** (`lib/emissions.ts`) computes
  the footprint from published emission factors (IPCC, India CEA grid factor,
  DEFRA conversion factors, Our World in Data dietary footprints).
- A **reduction-action engine** (`lib/actions.ts`) estimates, *for the specific
  user*, how much each action would save — by re-running the same engine. The
  same action ("carpool 2 days/week") yields a much bigger saving for a heavy
  commuter than for someone who already takes the metro. **This is the
  context-aware decision making the challenge asks for.**
- The **AI coach** (Gemini) only does *framing and prioritization*. It receives
  the already-computed numbers and candidate actions and writes encouraging,
  specific guidance — it never invents figures, so insights stay grounded and
  reproducible.
- If the AI is unavailable (no key, quota, network), a **deterministic
  rule-based coach** (`lib/insights.ts`) produces the same response shape, so the
  product — and the live demo — never breaks.

## 3. How the solution works

1. **Calculator** (`/calculator`) — a 4-step, keyboard-accessible quiz
   (transport, home energy, food, lifestyle). Defaults reflect a typical urban
   household so users can start instantly.
2. **Engine** — `calculateFootprint()` returns a per-category breakdown, monthly
   & annual totals, the top category, and comparisons to the India average,
   global average and the Paris-aligned sustainable target.
3. **Dashboard** (`/dashboard`) — headline numbers, an accessible breakdown
   chart, the personalized coach, and an **action tracker**: tick actions you
   commit to and watch your projected footprint drop in real time.
4. **Persistence** — everything is stored in the browser (`localStorage`). No
   account, no database, no personal data leaves the device.

### Architecture

```
app/
  page.tsx              Landing
  calculator/page.tsx   4-step quiz (client)
  dashboard/page.tsx    Results + coach + tracker (client)
  api/insights/route.ts Server route → Gemini (key stays server-side)
lib/
  emissions.ts          Pure calculation engine + factors  ← unit tested
  actions.ts            Context-aware reduction actions     ← unit tested
  insights.ts           Deterministic rule-based fallback coach
  schema.ts             Zod validation (shared client + server)
  storage.ts            SSR-safe localStorage helpers
components/             Accessible UI (forms, chart, coach, tracker)
__tests__/              Vitest unit tests
```

## 4. Assumptions

- Emission factors are India-leaning, rounded estimates for **awareness**, not
  regulatory accounting.
- Household electricity and cooking gas are split evenly across household members
  to approximate a personal share.
- Food and shopping footprints use representative averages per diet/shopping
  habit rather than itemized logging, to keep the quiz under a minute.
- Flight emissions use round per-flight figures inclusive of radiative forcing.

## 5. Evaluation criteria mapping

| Criterion | How it's addressed |
|---|---|
| **Problem alignment** | Full understand → track → reduce loop with personalized insights |
| **Code quality** | TypeScript, pure functions, clear `lib`/`components`/`api` separation, documented sources |
| **Security** | API key server-only, Zod validation of all input, rate limiting, security headers, no secrets in repo |
| **Efficiency** | No heavy chart libraries, client-side persistence (no DB), graceful AI fallback |
| **Testing** | Vitest unit tests covering the emission engine and action-savings logic |
| **Accessibility** | Semantic HTML, ARIA, keyboard navigation, skip link, focus styles, screen-reader data table, WCAG-AA contrast, reduced-motion support |

## 6. Getting started

```bash
npm install

# add your free Gemini key (https://aistudio.google.com/apikey)
cp .env.example .env.local
# edit .env.local → GEMINI_API_KEY=...

npm run dev      # http://localhost:3000
npm test         # run unit tests
npm run build    # production build
```

> The app works **without** a Gemini key — it falls back to the rule-based
> coach. The key only upgrades the coaching copy to AI-generated.

## 7. Deployment

Deploys to Vercel out of the box:

1. Push this repo to GitHub (public, single branch).
2. Import it in Vercel.
3. Add the environment variable `GEMINI_API_KEY` in the Vercel dashboard.
4. Deploy.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zod · Google Gemini ·
Vitest.

---

*Estimates are for awareness only and should not be treated as certified carbon
accounting.*
