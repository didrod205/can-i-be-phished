// Pure, browser-safe data model. DoH (DNS-over-HTTPS) is CORS-open and never
// rate-blocks, so the exact same checks run in the CLI, in CI, and live in the page.

export type Band = "protected" | "partial" | "spoofable" | "unknown";

export interface DmarcInfo {
  present: boolean;
  policy?: "none" | "quarantine" | "reject";
  pct?: number;
  subPolicy?: string;
  raw?: string;
}

export interface SpfInfo {
  present: boolean;
  /** the `all` mechanism qualifier: fail (-all), softfail (~all), neutral (?all), pass (+all). */
  all?: "fail" | "softfail" | "neutral" | "pass";
  raw?: string;
}

export interface Verdict {
  band: Band;
  /** 0–100; higher = harder to impersonate. */
  score: number;
  label: string;
  reasons: string[];
}

export interface DomainResult {
  domain: string;
  name?: string;
  category?: string;
  dmarc: DmarcInfo;
  spf: SpfInfo;
  verdict: Verdict;
  checkedAt: string;
}

export interface BoardEntry {
  name: string;
  domain: string;
  category: string;
  band: Band;
  score: number;
  policy: string;
}

export interface Board {
  generatedAt: string;
  total: number;
  spoofable: number;
  categories: { key: string; label: string }[];
  entries: BoardEntry[];
}

export const BAND_LABEL: Record<Band, string> = {
  protected: "Protected",
  partial: "Partly protected",
  spoofable: "Spoofable",
  unknown: "Couldn't check",
};

export const BAND_EMOJI: Record<Band, string> = {
  protected: "🛡️",
  partial: "⚠️",
  spoofable: "🎣",
  unknown: "❔",
};
