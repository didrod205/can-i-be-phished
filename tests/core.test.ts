import { describe, it, expect } from "vitest";
import { parseDmarc, parseSpf } from "../src/dmarc.js";
import { verdictFor } from "../src/score.js";
import { analyzeDomain, normalizeDomain } from "../src/analyze.js";

describe("parseDmarc", () => {
  it("reads the policy and pct", () => {
    expect(parseDmarc(['v=DMARC1; p=reject; rua=mailto:x@y.com']).policy).toBe("reject");
    expect(parseDmarc(['v=DMARC1; p=quarantine; pct=50']).pct).toBe(50);
    expect(parseDmarc(['v=DMARC1; p=none']).policy).toBe("none");
    expect(parseDmarc(["some other txt"]).present).toBe(false);
  });
});

describe("parseSpf", () => {
  it("reads the all qualifier", () => {
    expect(parseSpf(["v=spf1 include:_spf.google.com -all"]).all).toBe("fail");
    expect(parseSpf(["v=spf1 a mx ~all"]).all).toBe("softfail");
    expect(parseSpf(["nope"]).present).toBe(false);
  });
});

describe("verdictFor", () => {
  it("p=reject → protected", () => {
    expect(verdictFor({ present: true, policy: "reject" }, { present: true, all: "fail" }).band).toBe("protected");
  });
  it("p=none → spoofable", () => {
    const v = verdictFor({ present: true, policy: "none" }, { present: true, all: "softfail" });
    expect(v.band).toBe("spoofable");
    expect(v.reasons.join(" ")).toMatch(/delivered/);
  });
  it("no DMARC → spoofable", () => {
    expect(verdictFor({ present: false }, { present: false }).band).toBe("spoofable");
  });
  it("p=quarantine → partial; pct<100 stays partial", () => {
    expect(verdictFor({ present: true, policy: "quarantine" }, { present: true, all: "fail" }).band).toBe("partial");
    expect(verdictFor({ present: true, policy: "reject", pct: 25 }, { present: true, all: "fail" }).band).toBe("partial");
  });
});

describe("normalizeDomain", () => {
  it("strips scheme, www, and paths", () => {
    expect(normalizeDomain("https://www.StJude.org/donate?x=1")).toBe("stjude.org");
  });
});

function doh(answers: Record<string, string[]>): typeof fetch {
  return (async (url: string) => {
    const name = decodeURIComponent((String(url).match(/name=([^&]+)/) || [])[1] || "");
    const recs = answers[name] ?? [];
    return { ok: true, status: 200, json: async () => ({ Answer: recs.map((data) => ({ type: 16, data })) }) } as unknown as Response;
  }) as typeof fetch;
}

describe("analyzeDomain (stubbed DoH)", () => {
  it("calls a p=none institution spoofable, with the records", async () => {
    const fetchImpl = doh({
      "_dmarc.example.org": ['"v=DMARC1; p=none; rua=mailto:a@b.com"'],
      "example.org": ['"v=spf1 include:_spf.example.org ~all"'],
    });
    const r = await analyzeDomain("EXAMPLE.org", { fetchImpl });
    expect(r.domain).toBe("example.org");
    expect(r.dmarc.policy).toBe("none");
    expect(r.spf.all).toBe("softfail");
    expect(r.verdict.band).toBe("spoofable");
  });
  it("calls a p=reject institution protected", async () => {
    const fetchImpl = doh({ "_dmarc.safe.gov": ['"v=DMARC1; p=reject"'], "safe.gov": ['"v=spf1 -all"'] });
    const r = await analyzeDomain("safe.gov", { fetchImpl });
    expect(r.verdict.band).toBe("protected");
  });
});
