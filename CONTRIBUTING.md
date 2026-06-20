# Contributing to CarbonCompass

Thanks for your interest! This project favours small, well-tested, readable changes.

## Development

```bash
npm install
cp .env.example .env.local   # add a Gemini key (optional; app works without it)
npm run dev
```

## Before opening a PR

```bash
npm run lint     # ESLint (next/core-web-vitals)
npm run format   # Prettier
npm test         # Vitest unit + API + component tests
npm run build    # production build must pass
```

CI runs lint, tests and build on every push (`.github/workflows/ci.yml`).

## Conventions

- **TypeScript, strict mode.** Avoid `any`; prefer explicit types.
- **Pure logic lives in `lib/`** and must be unit-tested. UI lives in
  `components/` and pages in `app/`.
- **Keep AI grounded:** model calls only frame/prioritize data the engine
  already computed — never let the model invent numbers.
- **Accessibility is required**, not optional: semantic HTML, ARIA, keyboard
  support, sufficient contrast.
- Keep functions small and documented with a short JSDoc comment.
