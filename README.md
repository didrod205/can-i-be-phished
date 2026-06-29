# can-i-be-phished 🎣

**Can a scammer send email that looks like it came from your hospital, school, or charity?** Paste any organization's domain and find out instantly. It checks whether the domain enforces **DMARC** — the setting that stops anyone from forging its address — and tells you, plainly, if it can be spoofed. No API key, runs in your browser, nothing about you is sent anywhere.

### 🌐 [**Check any domain + the wall of spoofable trusted institutions →**](https://didrod205.github.io/can-i-be-phished/)

```bash
npx can-i-be-phished stjude.org
npx can-i-be-phished list --list charity
```

```
  wish.org · Make-A-Wish
  Spoofable 🎣 (25/100)

    • DMARC p=none — monitoring only; forged mail is still delivered to inboxes.
    • SPF ends in ~all (softfail) — permissive on its own.

  DMARC: v=DMARC1; p=none; rua=mailto:DMARCAlerts@wish.org; …
```

## Why

Email is trivially forgeable by default — the only thing that stops a scammer
from putting `From: your-children's-hospital.org` on a phishing email is a DNS
record called **DMARC** set to `p=reject`. Most organizations never finish setting
it up. The result: a snapshot of trusted institutions found that **27 of 48** —
including **Make-A-Wish, the Salvation Army, Doctors Without Borders (no DMARC at
all), MIT, Penn State, and a children's hospital** — don't fully block someone
impersonating them. This tool lets anyone check the institutions they trust, and
keeps a running wall of the ones that haven't fixed it.

## How it works

```
DNS-over-HTTPS (Cloudflare / Google, keyless, CORS)  ─→  _dmarc.<domain> TXT → policy
                                                     ─→  <domain> TXT       → SPF
                                                              ↓
                                  p=reject → protected · p=none / missing → spoofable
```

- **Runs anywhere** — DoH is CORS-open and never rate-blocks, so the exact same
  check runs in the CLI, in CI, and **live in your browser** (no backend, no key).
- **Defensible** — it reports a domain's **published DNS policy**. "Spoofable"
  means a forged `From:` can reach inboxes; it is **not** a claim the org was
  hacked or that mail is being forged today. It's a fixable config.
- The **live site** is static: a daily GitHub Action re-checks the watchlist and
  commits a fresh leaderboard. No server.

## Install & usage

```bash
npm i -g can-i-be-phished     # then:  can-i-be-phished stjude.org
# or zero-install:
npx can-i-be-phished irs.gov
```

```bash
can-i-be-phished harvard.edu             # check one domain
can-i-be-phished list                    # check the whole trusted-institution watchlist
can-i-be-phished list --list childrens-hospital   # one category
can-i-be-phished stjude.org --json       # machine-readable
```

`phishcheck` is a shorter alias. Categories: `childrens-hospital`, `charity`,
`university`, `school-district`, `government`.

## What the verdict means

| Verdict | DMARC policy | A forged email from this domain… |
| --- | --- | --- |
| **Protected** 🛡️ | `p=reject` | is rejected before the inbox |
| **Partly protected** ⚠️ | `p=quarantine` (or `pct<100`) | lands in spam, or some slips through |
| **Spoofable** 🎣 | `p=none` or no DMARC | is delivered to the inbox |

## Library

```ts
import { analyzeDomain } from "can-i-be-phished";

const r = await analyzeDomain("salvationarmyusa.org");
r.verdict.band;     // "spoofable"
r.dmarc.policy;     // "none"
r.verdict.reasons;  // plain-English why
```

## Honesty & responsibility

Everything here comes from a domain's **public** DNS — the same records every mail
server reads. The tool reports a **configuration fact** ("this domain's DMARC
policy is `p=none`, so a forged From can reach inboxes"), never an accusation that
an organization was breached or is being impersonated right now. It deliberately
does **not** explain how to spoof anyone — only whether a domain is protected, and
that the fix is to publish `p=reject`. It targets **organizations**, not people.

## Contributing

Add an institution to the watchlist, or a check (DKIM, MTA-STS, BIMI). See
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © [didrod205](https://github.com/didrod205)

---

<sub>It's a public DNS record and a one-line fix. This just shows who hasn't shipped it. Judge for yourself.</sub>
