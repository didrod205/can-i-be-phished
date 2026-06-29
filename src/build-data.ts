// Node entry run by the GitHub Actions cron (and locally to seed). Checks the
// trusted-institution watchlist and writes the leaderboard the site reads. DoH
// works from any IP and never rate-blocks, so this is reliable in CI.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { analyzeDomain } from "./analyze.js";
import { WATCHLIST, CATEGORIES } from "./watchlist.js";
import type { Board, BoardEntry } from "./types.js";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const out = resolve(process.cwd(), "web/public/data/board.json");

async function main(): Promise<void> {
  const entries: BoardEntry[] = [];
  let i = 0;
  for (const o of WATCHLIST) {
    i += 1;
    try {
      const r = await analyzeDomain(o.domain, { name: o.name, category: o.category });
      entries.push({ name: o.name, domain: o.domain, category: o.category, band: r.verdict.band, score: r.verdict.score, policy: r.dmarc.present ? `p=${r.dmarc.policy ?? "?"}` : "no DMARC" });
      process.stdout.write(`  ${i}/${WATCHLIST.length} ${o.domain} → ${r.verdict.band}\n`);
    } catch (e) {
      process.stdout.write(`  ${i}/${WATCHLIST.length} ${o.domain} → error (${(e as Error).message})\n`);
    }
    await sleep(60);
  }
  entries.sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  const board: Board = {
    generatedAt: new Date().toISOString(),
    total: entries.length,
    spoofable: entries.filter((e) => e.band !== "protected").length,
    categories: CATEGORIES,
    entries,
  };
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(board) + "\n", "utf8");
  process.stdout.write(`done: ${board.spoofable}/${board.total} spoofable → ${out}\n`);
}

main().catch((e) => {
  process.stderr.write(`can-i-be-phished build-data failed: ${(e as Error).message}\n`);
  process.exit(1);
});
