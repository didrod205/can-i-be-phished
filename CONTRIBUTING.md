# Contributing to can-i-be-phished

Thanks for your interest! The most welcome contributions are **new institutions
for the watchlist** and **new checks** (DKIM, MTA-STS, BIMI).

## Getting started

```bash
git clone https://github.com/didrod205/can-i-be-phished.git
cd can-i-be-phished
npm install
npm test            # vitest (pure parsers + stubbed DoH)
npm run typecheck
npm run build       # tsup → dist/
npm run example     # live check (DoH, no key, no block)
npm run dev         # the site at localhost:5173
```

DoH is keyless and CORS-open — no setup, runs anywhere.

## Project layout

```
src/
  dns.ts        # DNS-over-HTTPS TXT/MX (Cloudflare + Google, browser-safe, keyless)
  dmarc.ts      # parse DMARC policy + SPF qualifier (pure)
  score.ts      # spoofability verdict from the DMARC policy (pure)
  analyze.ts    # analyzeDomain: look up + score
  watchlist.ts  # the trusted-institution list, by category
  render/       # console / json
  cli.ts        # cac CLI (a domain, or `list`)
  build-data.ts # node: check the watchlist → web/public/data/board.json (the cron)
web/            # the static site (reuses src/ for the live in-browser check)
.github/workflows/crawl.yml   # re-checks the watchlist daily and commits
tests/          # parsers + stubbed analyzeDomain
```

## Adding an institution

Add an entry to `WATCHLIST` in `src/watchlist.ts`:

```ts
{ name: "Boston Children's Hospital", domain: "childrenshospital.org", category: "childrens-hospital" }
```

Use the **organizational domain** (the one in their email addresses), not a
marketing redirect. Prefer institutions the public broadly trusts — that's where
"this can be impersonated" actually matters.

## The one rule

This reports a **public configuration fact** about an **organization's** domain —
"its DMARC policy is X, so a forged From can/can't reach inboxes." Never frame it
as an accusation (not "they were hacked", not "they're sending you scams"), never
target an individual, and never add anything that teaches how to actually spoof a
domain. The point is to get more institutions to publish `p=reject`.

## Quality bar

- [ ] `npm run typecheck && npm test && npm run build` pass.
- [ ] The core imports no `node:*` — keep it browser-safe (the live check runs it).
