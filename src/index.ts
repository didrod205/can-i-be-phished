// Public, browser-safe API. No node:* — DoH is CORS-open, so the live check runs
// in the browser with this exact core.
export { txt, hasMx } from "./dns.js";
export type { DnsOptions } from "./dns.js";
export { parseDmarc, parseSpf } from "./dmarc.js";
export { verdictFor } from "./score.js";
export { analyzeDomain, normalizeDomain } from "./analyze.js";
export { WATCHLIST, CATEGORIES } from "./watchlist.js";
export type { Org } from "./watchlist.js";
export { BAND_LABEL, BAND_EMOJI } from "./types.js";
export type { Band, DmarcInfo, SpfInfo, Verdict, DomainResult, BoardEntry, Board } from "./types.js";
