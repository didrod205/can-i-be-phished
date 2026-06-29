import type { DmarcInfo, SpfInfo, Verdict, Band } from "./types.js";
import { BAND_LABEL } from "./types.js";

// Pure. The verdict follows the DMARC policy at the org domain — the thing that
// actually decides whether a forged "From: your-hospital.org" lands in the inbox.

export function verdictFor(dmarc: DmarcInfo, spf: SpfInfo): Verdict {
  const reasons: string[] = [];
  let band: Band;
  let score: number;

  if (!dmarc.present) {
    band = "spoofable";
    score = 10;
    reasons.push("No DMARC record — nothing tells inboxes to reject mail that forges this domain.");
  } else if (dmarc.policy === "reject") {
    band = "protected";
    score = 95;
    reasons.push("DMARC p=reject — mail that forges this domain is rejected outright.");
  } else if (dmarc.policy === "quarantine") {
    band = "partial";
    score = 55;
    reasons.push("DMARC p=quarantine — forged mail is sent to spam, not blocked.");
  } else if (dmarc.policy === "none") {
    band = "spoofable";
    score = 25;
    reasons.push("DMARC p=none — monitoring only; forged mail is still delivered to inboxes.");
  } else {
    band = "spoofable";
    score = 20;
    reasons.push("DMARC record present but has no enforcing policy (p=).");
  }

  // pct<100 means only a fraction of mail is actually enforced.
  if ((dmarc.policy === "reject" || dmarc.policy === "quarantine") && dmarc.pct !== undefined && dmarc.pct < 100) {
    band = band === "protected" ? "partial" : band;
    score = Math.min(score, 65);
    reasons.push(`But only ${dmarc.pct}% of mail is enforced (pct=${dmarc.pct}) — the rest slips through.`);
  }

  if (!spf.present) reasons.push("No SPF record either — senders aren't restricted.");
  else if (spf.all && spf.all !== "fail") reasons.push(`SPF ends in ${spf.all === "softfail" ? "~all (softfail)" : spf.all === "neutral" ? "?all (neutral)" : "+all (pass)"} — permissive on its own.`);

  return { band, score, label: BAND_LABEL[band], reasons };
}
