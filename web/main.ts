import { analyzeDomain, BAND_EMOJI, BAND_LABEL } from "../src/index.js";
import type { Board, DomainResult } from "../src/index.js";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const form = $<HTMLFormElement>("check");
const domainInput = $<HTMLInputElement>("domain");
const goBtn = $<HTMLButtonElement>("go");
const statusEl = $<HTMLElement>("status");
const resultEl = $<HTMLElement>("result");
const boardEl = $<HTMLElement>("board");
const boardSub = $<HTMLElement>("board-sub");

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderResult(r: DomainResult): void {
  resultEl.innerHTML = `<div class="card b-${r.verdict.band}">
    <div class="dom">${esc(r.domain)}${r.name ? ` <span class="dim">· ${esc(r.name)}</span>` : ""}</div>
    <div class="vd">${esc(r.verdict.label)} ${BAND_EMOJI[r.verdict.band]} <span class="dim" style="font-size:.9rem">${r.verdict.score}/100</span></div>
    <ul class="reasons">${r.verdict.reasons.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    <div class="records">DMARC: ${r.dmarc.present ? esc(r.dmarc.raw!) : "— none"}<br>SPF: ${r.spf.present ? esc(r.spf.raw!) : "— none"}</div>
  </div>`;
}

async function check(): Promise<void> {
  const v = domainInput.value.trim();
  if (!v) return;
  goBtn.disabled = true;
  statusEl.textContent = `checking ${v}'s DNS…`;
  resultEl.innerHTML = "";
  try {
    const r = await analyzeDomain(v);
    statusEl.textContent = "";
    renderResult(r);
  } catch (e) {
    statusEl.textContent = (e as Error).message;
  } finally {
    goBtn.disabled = false;
  }
}

function renderBoard(b: Board): void {
  boardSub.textContent = `— ${b.spoofable} of ${b.total} don't fully block it (updated ${new Date(b.generatedAt).toLocaleDateString()})`;
  const order: Record<string, number> = { spoofable: 0, partial: 1, unknown: 2, protected: 3 };
  const html: string[] = [];
  for (const { key, label } of b.categories) {
    const rows = b.entries
      .filter((e) => e.category === key && e.band !== "protected")
      .sort((a, c) => (order[a.band]! - order[c.band]!) || a.score - c.score);
    if (rows.length === 0) continue;
    html.push(`<div class="cat"><h3>${esc(label)}</h3>${rows
      .map(
        (e) => `<div class="org b-${e.band}">
          <span class="ic">${BAND_EMOJI[e.band]}</span>
          <span class="nm">${esc(e.name)}</span>
          <span class="dm">${esc(e.domain)}</span>
          <span class="pol">${esc(e.policy)}</span>
        </div>`,
      )
      .join("")}</div>`);
  }
  boardEl.innerHTML = html.join("") || `<div class="dim">Everything on the list enforces DMARC. 🛡️</div>`;
}

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  void check();
});

(async () => {
  try {
    const res = await fetch("./data/board.json", { cache: "no-cache" });
    if (res.ok) renderBoard((await res.json()) as Board);
    else boardSub.textContent = "— leaderboard building…";
  } catch {
    boardSub.textContent = "— leaderboard building…";
  }
})();
