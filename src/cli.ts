#!/usr/bin/env node
import { cac } from "cac";
import { analyzeDomain } from "./analyze.js";
import { WATCHLIST, CATEGORIES } from "./watchlist.js";
import { toJSON } from "./render/json.js";
import type { Board, BoardEntry } from "./types.js";

const VERSION = "0.1.0";
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function fail(message: string): never {
  process.stderr.write(`\ncan-i-be-phished: ${message}\n\n`);
  process.exit(2);
}

interface Flags {
  list?: string | boolean;
  json?: boolean;
  color?: boolean;
}

async function run(domain: string | undefined, flags: Flags): Promise<void> {
  if (flags.color === false) process.env["NO_COLOR"] = "1";

  // `--list [category]` (or `list`) → check the watchlist
  if (flags.list !== undefined || domain === "list") {
    const cat = typeof flags.list === "string" ? flags.list : undefined;
    const orgs = cat ? WATCHLIST.filter((o) => o.category === cat) : WATCHLIST;
    if (orgs.length === 0) fail(`no category "${cat}". try: ${CATEGORIES.map((c) => c.key).join(" | ")}`);
    const entries: BoardEntry[] = [];
    for (const o of orgs) {
      try {
        const r = await analyzeDomain(o.domain, { name: o.name, category: o.category });
        entries.push({ name: o.name, domain: o.domain, category: o.category, band: r.verdict.band, score: r.verdict.score, policy: r.dmarc.present ? `p=${r.dmarc.policy ?? "?"}` : "no DMARC" });
      } catch {
        /* skip */
      }
      await sleep(40);
    }
    entries.sort((a, b) => a.score - b.score);
    const board: Board = { generatedAt: new Date().toISOString(), total: entries.length, spoofable: entries.filter((e) => e.band !== "protected").length, categories: CATEGORIES, entries };
    if (flags.json) return void process.stdout.write(toJSON(board) + "\n");
    const { renderBoard } = await import("./render/console.js");
    return void process.stdout.write(renderBoard(board));
  }

  if (!domain) fail('Give a domain, or "list":\n  can-i-be-phished stjude.org\n  can-i-be-phished list --list charity');
  const r = await analyzeDomain(domain).catch((e) => fail((e as Error).message));
  if (flags.json) return void process.stdout.write(toJSON(r) + "\n");
  const { renderDomain } = await import("./render/console.js");
  process.stdout.write(renderDomain(r));
}

const cli = cac("can-i-be-phished");

cli
  .command("[domain]", "Check whether a domain can be email-spoofed (or 'list' for the watchlist)")
  .option("--list [category]", `Check the trusted-institution watchlist (${CATEGORIES.map((c) => c.key).join(" | ")})`)
  .option("--json", "JSON output")
  .option("--no-color", "Disable colors")
  .action((domain: string | undefined, flags: Flags) => run(domain, flags));

cli.help();
cli.version(VERSION);

try {
  cli.parse();
} catch (err) {
  fail((err as Error).message);
}
