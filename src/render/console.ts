import pc from "picocolors";
import type { Band, Board, DomainResult } from "../types.js";
import { BAND_EMOJI } from "../types.js";

function paint(band: Band, s: string): string {
  if (band === "protected") return pc.green(s);
  if (band === "partial") return pc.yellow(s);
  if (band === "spoofable") return pc.red(s);
  return pc.dim(s);
}

export function renderDomain(r: DomainResult): string {
  const L: string[] = [];
  const ind = "  ";
  L.push("");
  L.push(`${ind}${pc.bold(r.domain)}${r.name ? pc.dim(" · " + r.name) : ""}`);
  L.push(`${ind}${paint(r.verdict.band, pc.bold(`${r.verdict.label}`))} ${BAND_EMOJI[r.verdict.band]} ${pc.dim(`(${r.verdict.score}/100)`)}`);
  L.push("");
  for (const why of r.verdict.reasons) L.push(`${ind}  ${r.verdict.band === "protected" ? pc.green("✓") : pc.red("•")} ${why}`);
  L.push("");
  L.push(`${ind}${pc.dim("DMARC: " + (r.dmarc.present ? r.dmarc.raw : "—  (no _dmarc record)"))}`);
  L.push(`${ind}${pc.dim("SPF:   " + (r.spf.present ? r.spf.raw : "—  (no SPF record)"))}`);
  L.push("");
  L.push(`${ind}${pc.dim("public DNS only, nothing about you sent anywhere. 'spoofable' = a forged From: can reach inboxes — not that they were hacked.")}`);
  L.push("");
  return L.join("\n");
}

export function renderBoard(b: Board): string {
  const L: string[] = [];
  const ind = "  ";
  L.push("");
  L.push(`${ind}${pc.bold("🎣 can-i-be-phished")} ${pc.dim(`— trusted institutions a scammer could impersonate (${b.spoofable} of ${b.total} spoofable)`)}`);
  L.push("");
  const byCat = new Map<string, typeof b.entries>();
  for (const e of b.entries) {
    if (e.band === "protected") continue;
    const arr = byCat.get(e.category) ?? [];
    arr.push(e);
    byCat.set(e.category, arr);
  }
  for (const { key, label } of b.categories) {
    const arr = byCat.get(key);
    if (!arr || arr.length === 0) continue;
    L.push(`${ind}${pc.bold(label)}`);
    for (const e of arr) L.push(`${ind}  ${paint(e.band, BAND_EMOJI[e.band])} ${e.name} ${pc.dim(e.domain + " · " + e.policy)}`);
    L.push("");
  }
  if (b.spoofable === 0) L.push(`${ind}${pc.green("Every institution on the list enforces DMARC. Nice.")}`);
  L.push(`${ind}${pc.dim("public DNS, no key. generated " + b.generatedAt.slice(0, 16).replace("T", " "))}`);
  L.push("");
  return L.join("\n");
}
