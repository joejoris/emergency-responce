// UI + responsiveness check using installed Chrome via Playwright.
// Usage: node scripts/ui-check.mjs [baseUrl]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] ?? "http://localhost:3000";
const widths = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
];
const pages = ["/", "/sos", "/first-aid", "/incidents", "/contacts", "/family", "/dashboard", "/settings", "/offline"];

const results = [];
const pass = (m) => { results.push(`PASS  ${m}`); };
const fail = (m) => { results.push(`FAIL  ${m}`); };

await mkdir("ui-shots", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];

for (const vp of widths) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  for (const path of pages) {
    const page = await ctx.newPage();
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(`${vp.name} ${path}: ${msg.text()}`); });
    page.on("pageerror", (err) => errors.push(`${vp.name} ${path}: ${err.message}`));
    try {
      const res = await page.goto(base + path, { waitUntil: "networkidle" });
      if (!res || res.status() !== 200) fail(`${vp.name} ${path} status ${res?.status()}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 2) fail(`${vp.name} ${path} horizontal overflow ${overflow}px`);
      else pass(`${vp.name} ${path} no h-overflow`);
      await page.screenshot({ path: `ui-shots/${vp.name}${path.replaceAll("/", "_") || "_home"}.png`, fullPage: true });
    } catch (e) {
      fail(`${vp.name} ${path} error: ${e.message}`);
    }
    await page.close();
  }
  await ctx.close();
}

// ── Interaction checks (desktop) ─────────────────────────────
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (err) => errors.push(`interaction: ${err.message}`));

// First-aid search
await page.goto(base + "/first-aid", { waitUntil: "networkidle" });
await page.getByPlaceholder(/Search symptoms/).fill("burn");
await page.waitForTimeout(200);
const cards = await page.locator('a[href^="/first-aid/"]').count();
cards === 1 ? pass("first-aid search filters to 1 result") : fail(`first-aid search returned ${cards} results`);

// Contacts add + persist
await page.goto(base + "/contacts", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.getByLabel("Name").fill("Jane Doe");
await page.getByLabel("Phone").fill("+123456789");
await page.getByRole("button", { name: "Add" }).click();
await page.waitForTimeout(200);
const contactVisible = await page.getByText("Jane Doe").count();
contactVisible === 1 ? pass("contact added") : fail(`contact not added (${contactVisible})`);
await page.reload({ waitUntil: "networkidle" });
(await page.getByText("Jane Doe").count()) === 1 ? pass("contact persists after reload") : fail("contact lost after reload");

// Family check-in
await page.goto(base + "/family", { waitUntil: "networkidle" });
await page.getByLabel("Household member name").fill("Sam");
await page.getByRole("button", { name: "Add" }).click();
await page.getByRole("button", { name: "Safe" }).click();
await page.waitForTimeout(100);
const tally = await page.getByText(/1 safe/).count();
tally > 0 ? pass("family check-in updates tally") : fail("family tally not updated");

// Incidents submit
await page.goto(base + "/incidents", { waitUntil: "networkidle" });
await page.getByPlaceholder("Address or coordinates").fill("Test Street 1");
await page.getByPlaceholder(/What happened/).fill("Smoke visible near the market.");
await page.getByRole("button", { name: "Submit report" }).click();
await page.waitForTimeout(200);
(await page.getByText("Smoke visible near the market.").count()) > 0
  ? pass("incident submitted and listed")
  : fail("incident not listed after submit");

// Dashboard roll-call
await page.goto(base + "/dashboard", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Safe" }).first().click();
await page.waitForTimeout(100);
(await page.getByText(/1\/5 safe/).count()) > 0 ? pass("roll-call updates") : fail("roll-call not updated");

// SOS activation + cancel
await page.goto(base + "/sos", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Activate SOS/ }).click();
await page.waitForTimeout(400);
const cancelling = await page.getByRole("button", { name: "Cancel" }).count();
if (cancelling === 1) {
  await page.getByRole("button", { name: "Cancel" }).click();
  pass("SOS arming + cancel works");
} else {
  fail("SOS arming state not shown");
}

// Offline page call button
await page.goto(base + "/offline", { waitUntil: "networkidle" });
(await page.getByRole("link", { name: /CALL 112/ }).count()) === 1 ? pass("offline page call link") : fail("offline call link missing");

await ctx.close();
await browser.close();

console.log(results.join("\n"));
if (errors.length) {
  console.log("\nConsole/page errors:");
  for (const e of errors) console.log("  " + e);
}
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed === 0 ? 0 : 1);
