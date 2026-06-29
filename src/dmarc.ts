import type { DmarcInfo, SpfInfo } from "./types.js";

// Pure parsers. DMARC is what tells receiving inboxes what to do with mail that
// fails authentication — `p=reject` blocks forgeries, `p=none` lets them through.

export function parseDmarc(txts: string[]): DmarcInfo {
  const rec = txts.find((t) => /^v=DMARC1/i.test(t.trim()));
  if (!rec) return { present: false };
  const tag = (k: string): string | undefined => {
    const m = rec.match(new RegExp(`(?:^|;)\\s*${k}=([^;]+)`, "i"));
    return m ? m[1]!.trim().toLowerCase() : undefined;
  };
  const p = tag("p");
  const policy = p === "reject" || p === "quarantine" || p === "none" ? (p as DmarcInfo["policy"]) : undefined;
  const pctRaw = tag("pct");
  return { present: true, policy, pct: pctRaw !== undefined ? Number(pctRaw) : undefined, subPolicy: tag("sp"), raw: rec };
}

export function parseSpf(txts: string[]): SpfInfo {
  const rec = txts.find((t) => /^v=spf1/i.test(t.trim()));
  if (!rec) return { present: false };
  let all: SpfInfo["all"] | undefined;
  if (/[-]all\b/.test(rec)) all = "fail";
  else if (/~all\b/.test(rec)) all = "softfail";
  else if (/\?all\b/.test(rec)) all = "neutral";
  else if (/\+?all\b/.test(rec)) all = "pass";
  return { present: true, all, raw: rec };
}
