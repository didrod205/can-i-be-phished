// Browser-safe DNS-over-HTTPS. Cloudflare and Google both return JSON with
// `access-control-allow-origin: *`, work from any IP (including CI), and don't
// rate-block — so this runs identically in the CLI, the cron, and the browser.

export interface DnsOptions {
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
}

const PROVIDERS = ["https://dns.google/resolve", "https://cloudflare-dns.com/dns-query"];

interface DohAnswer {
  type?: number;
  data?: string;
}

async function query(name: string, type: string, opts: DnsOptions): Promise<DohAnswer[]> {
  const f = opts.fetchImpl ?? fetch;
  for (const base of PROVIDERS) {
    try {
      const res = await f(`${base}?name=${encodeURIComponent(name)}&type=${type}`, { headers: { accept: "application/dns-json" }, signal: opts.signal });
      if (!res.ok) continue;
      const d = (await res.json()) as { Answer?: DohAnswer[] };
      return d.Answer ?? [];
    } catch {
      // try the next provider
    }
  }
  return [];
}

/** TXT records for a name (quotes stripped, multi-string chunks joined). */
export async function txt(name: string, opts: DnsOptions = {}): Promise<string[]> {
  const ans = await query(name, "TXT", opts);
  return ans
    .filter((a) => a.type === 16 && typeof a.data === "string")
    .map((a) =>
      String(a.data)
        .replace(/^"|"$/g, "")
        .replace(/"\s+"/g, "")
        .trim(),
    );
}

/** Does the domain accept mail at all (has MX)? */
export async function hasMx(domain: string, opts: DnsOptions = {}): Promise<boolean> {
  const ans = await query(domain, "MX", opts);
  return ans.some((a) => a.type === 15);
}
