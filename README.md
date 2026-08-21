# folvyn-portfolio-mf

> Every portfolio Folvyn publishes, at **folvyn.mkirell.com/fol/&lt;slug&gt;**. Vue 3, Tailwind, Pinia.
> Every word and every asset reference comes from the API — no content is compiled in.

[![Vue](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vuedotjs)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![AWS](https://img.shields.io/badge/AWS-S3%20%C2%B7%20CloudFront-ff9900?style=flat-square&logo=amazonwebservices)](https://github.com/MKirell/folvyn-platform-iac)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square)](LICENSE)

**Live:** <https://folvyn.mkirell.com/fol/mohamed-khalil-zrelly>

## Table of contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [How data flows](#how-data-flows)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Related repositories](#related-repositories)
- [License](#license)
- [Author](#author)

## Overview

A single-page portfolio that holds **no content of its own**. Names, roles, projects, labels and the
language list all arrive from `folvyn-portfolio-ms` at runtime. Changing what the site says means
changing the database, not this repository.

Three consequences worth knowing up front:

- **Nothing is hardcoded per language.** The switcher offers whatever `availableLangs` returns. There is
  no `'en' | 'fr'` union anywhere in the codebase.
- **There is no adapter layer.** Components read the API's own field names directly — `ui.headings.about`,
  `experiences[i].doc`, `education.spokenLanguages`. No translation shim sits in between.
- **The build needs the API.** SEO prerendering fetches live content, so a broken API fails the build
  instead of shipping an empty page.

## Architecture

```text
Browser ──► CloudFront (folvyn.mkirell.com) ──► S3 (private, origin access control)
   │
   └── on mount: GET /api/v1/portfolio/<slug> ──► folvyn-portfolio-ms
                                                              │
                                                        MongoDB Atlas
```

At build time `vite-plugins/seo.ts` calls the same API and inlines a static shell plus JSON-LD into
`index.html`, so crawlers that do not run JavaScript still see real content.

## Tech stack

| Layer     | Choice                                     |
| --------- | ------------------------------------------ |
| Framework | Vue 3 (Composition API), TypeScript strict |
| Build     | Vite, mode-based env files                 |
| State     | Pinia                                      |
| Styling   | Tailwind CSS 4, CSS custom properties      |
| Icons     | `@lucide/vue`                              |
| Tests     | Vitest                                     |
| Hosting   | S3 + CloudFront                            |

## Quick start

**Prerequisites** — Node.js 22+, and `folvyn-portfolio-ms` running locally.

```bash
npm install
npm run dev
```

<http://localhost:5173>, talking to `http://localhost:3000/api/v1`.

**To develop against live data** without running the backend:

```bash
echo "VITE_API_BASE_URL=https://folvyn.mkirell.com/api/v1" > .env.development.local
npm run dev
```

Hot reload and devtools as usual, reading from production. Delete the file to go back to local — the live
API already allows `http://localhost:5173` as an origin.

### Scripts

```bash
npm run dev          # dev server against the local API
npm run build        # production build, bakes in .env.production
npm run preview      # serve the built output locally
npm run typecheck    # vue-tsc
npm run lint         # eslint, zero warnings tolerated
npm test             # vitest
npm run test:cov     # vitest with coverage
npm run check        # typecheck + lint + format + test
```

## Configuration

The only thing separating development from production is **which API the app talks to**. That is a single
variable, so switching environments is just which env file Vite loads.

| File                     | Loaded by       | Committed | `VITE_API_BASE_URL`                 |
| ------------------------ | --------------- | --------- | ----------------------------------- |
| `.env.development`       | `npm run dev`   | yes       | `http://localhost:3000/api/v1`      |
| `.env.production`        | `npm run build` | yes       | `https://folvyn.mkirell.com/api/v1` |
| `.env.development.local` | `npm run dev`   | no        | your override, wins over the above  |

Both committed files are safe to publish: everything Vite inlines ends up in the browser bundle anyway, so
a frontend env file can never hold a secret. Anything personal goes in `.env.development.local`.

To build against production data explicitly:

```bash
npm run dev -- --mode production
```

## How data flows

On mount the app calls `GET /portfolio` once and the Pinia store holds the response **exactly as the API
returns it**:

```ts
const store = usePortfolioStore()
const { ui, person, experiences, education } = storeToRefs(store)
```

The store caches per language, so switching languages re-fetches once and then reads from memory. If a
requested language does not exist the API's default is served instead.

`App.vue` renders one of three states — a spinner while the first request is in flight, an error panel
with a retry button if the API is unreachable, and the site once data has arrived. Nothing downstream ever
has to handle a null.

## Project structure

```text
src/
├── App.vue                     # loading / error / ready states
├── main.ts
├── components/
│   ├── layout/                 # AppNav, AppFooter
│   └── sections/               # Hero, About, Skills, Experience,
│                               #   Projects, Education, Achievements, Contact
├── stores/portfolio.ts         # Pinia store, per-language cache
├── services/portfolio.api.ts   # the only module that talks to the API
├── types/api.ts                # shapes mirroring the API response
├── composables/                # useLanguage, useTheme, useTypewriter,
│                               #   useModal, useShell
├── directives/reveal.ts        # IntersectionObserver scroll animation
├── utils/                      # text, scroll, flags, docs
├── assets/                     # flags, logos
└── style.css                   # design tokens + Tailwind

vite-plugins/seo.ts             # build-time SEO prerendering
test/                           # unit tests + fixtures
```

## Testing

```bash
npm test
npm run test:cov
```

No network. `test/setup.ts` stubs the API module and primes the Pinia store from fixtures captured from
the real service, so the suite runs against the true response shape rather than a hand-written mock.

| Area        | What is covered                                       |
| ----------- | ----------------------------------------------------- |
| Components  | Every section renders from store data                 |
| Composables | Language switching, theme, typewriter, shell          |
| Directive   | `v-reveal` IntersectionObserver behaviour             |
| Utils       | Text formatting, scroll helpers, flag and doc mapping |

## Deployment

Push to `develop` deploys dev; push to `main` deploys production. Both run the checks first, then the
release:

1. **checks** — typecheck, lint, format check, tests
2. **e2e** — Playwright in Chromium against the running site
3. **secrets** — the tree scanned for anything that looks like a credential
4. **deploy** — build against the live API, upload to S3, invalidate CloudFront, ship the renderer, ask
   it for every published portfolio, then smoke-test the live URL

A render pass also removes prerendered pages for slugs no portfolio claims any more: those pages name a
fingerprinted bundle, and a deploy that replaces the bundle would otherwise leave an address answering
with a page whose scripts are gone.

Every job writes a summary, so a run can be read from its Summary tab without opening a log.

Fingerprinted assets are uploaded immutable for a year; `index.html` is uploaded uncached, so a deploy is
visible immediately without serving stale JavaScript.

There is no local deploy script — CI is the only implementation of how the site gets published.

| Piece          | Where                                                                 |
| -------------- | --------------------------------------------------------------------- |
| Bucket         | `folvyn-spa-<env>-<account-id>`, private                              |
| CDN            | CloudFront with origin access control and SPA rewrites                |
| Provisioned by | [folvyn-platform-iac](https://github.com/MKirell/folvyn-platform-iac) |

Repository variables, all written by Terraform rather than clicked in:

| Variable                     | Effect                                        |
| ---------------------------- | --------------------------------------------- |
| `CI_ENABLED=false`           | turns the whole workflow off                  |
| `DEPLOY_ENABLED=false`       | keeps the checks, skips the deploy            |
| `API_BASE_URL`               | what the production build is compiled against |
| `AWS_DEPLOY_ROLE_ARN`        | OIDC role, no long-lived keys                 |
| `S3_BUCKET`                  | destination bucket                            |
| `CLOUDFRONT_DISTRIBUTION_ID` | distribution to invalidate                    |
| `SITE_URL`                   | smoke-tested after deploy                     |

When a required variable is missing the pipeline **fails loudly** rather than skipping silently.

## Security

This is a public, read-only site and holds no credentials. Everything Vite inlines is visible in the
browser bundle, so nothing secret is ever placed in an env file here.

The S3 bucket is private and reachable only through CloudFront origin access control — the bucket has no
public URL. CI authenticates to AWS through OIDC and holds no long-lived key.

## Related repositories

| Repository                                                            | Role                             |
| --------------------------------------------------------------------- | -------------------------------- |
| [folvyn-portfolio-ms](https://github.com/MKirell/folvyn-portfolio-ms) | The API this site reads          |
| [folvyn-platform-iac](https://github.com/MKirell/folvyn-platform-iac) | Terraform for every AWS resource |

## License

[Apache 2.0](LICENSE)

## Author

**Mohamed Khalil ZRELLY** — [LinkedIn](https://www.linkedin.com/in/mohamed-khalil-zrelly/) ·
[mkirell.com](https://mkirell.com/)
