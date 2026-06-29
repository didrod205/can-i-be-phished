import { txt, type DnsOptions } from "./dns.js";
import { parseDmarc, parseSpf } from "./dmarc.js";
import { verdictFor } from "./score.js";
import type { DomainResult } from "./types.js";

export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[/?#].*$/, "")
    .replace(/^[^a-z0-9].*/, "");
}

/** Look up a domain's DMARC + SPF and decide whether it can be impersonated. */
export async function analyzeDomain(input: string, opts: DnsOptions & { now?: number; name?: string; category?: string } = {}): Promise<DomainResult> {
  const domain = normalizeDomain(input);
  const [dmarcTxt, spfTxt] = await Promise.all([txt(`_dmarc.${domain}`, opts), txt(domain, opts)]);
  const dmarc = parseDmarc(dmarcTxt);
  const spf = parseSpf(spfTxt);
  return {
    domain,
    name: opts.name,
    category: opts.category,
    dmarc,
    spf,
    verdict: verdictFor(dmarc, spf),
    checkedAt: new Date(opts.now ?? Date.now()).toISOString(),
  };
}
