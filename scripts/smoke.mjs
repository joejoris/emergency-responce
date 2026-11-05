// Route smoke test — run against a running server: node scripts/smoke.mjs [baseUrl]
const base = process.argv[2] ?? "http://localhost:3000";

const routes = [
  "/",
  "/sos",
  "/first-aid",
  "/first-aid/cpr",
  "/first-aid/bleeding",
  "/first-aid/choking",
  "/first-aid/burns",
  "/first-aid/anaphylaxis",
  "/first-aid/seizure",
  "/incidents",
  "/dashboard",
  "/contacts",
  "/family",
  "/settings",
  "/login",
  "/offline",
  "/manifest.webmanifest",
  "/icon.svg",
  "/sw.js",
];

let failed = 0;
for (const route of routes) {
  try {
    const res = await fetch(base + route);
    const ok = res.status === 200;
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${res.status}  ${route}`);
  } catch (err) {
    failed++;
    console.log(`FAIL  ERR   ${route}  (${err.message})`);
  }
}

console.log(failed === 0 ? "\nAll routes OK" : `\n${failed} route(s) failed`);
process.exit(failed === 0 ? 0 : 1);
