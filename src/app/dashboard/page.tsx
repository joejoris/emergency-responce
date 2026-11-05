"use client";

import { useState } from "react";

const queue = [
  { id: "INC-1042", type: "Fire", location: "Industrial Park East, Unit 7", severity: "critical", age: "25 min" },
  { id: "INC-1041", type: "Traffic accident", location: "A4 near Junction 12", severity: "high", age: "10 min" },
  { id: "INC-1040", type: "Medical", location: "Central Station, Platform 2", severity: "high", age: "40 min" },
];

const people = [
  { name: "A. Rivera", site: "HQ — Floor 3" },
  { name: "J. Okafor", site: "HQ — Floor 3" },
  { name: "M. Chen", site: "Warehouse B" },
  { name: "S. Novak", site: "Warehouse B" },
  { name: "L. Duarte", site: "HQ — Floor 5" },
];

export default function DashboardPage() {
  const [checks, setChecks] = useState<Record<string, "safe" | "help" | null>>({});
  const safeCount = people.filter((p) => checks[p.name] === "safe").length;
  const helpCount = people.filter((p) => checks[p.name] === "help").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black">Responder Console</h1>
      <p className="mt-1 text-sm text-neutral-400">Demo data — connect a backend (Supabase) to go live.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-xl font-bold">Triage Queue</h2>
          <ul className="mt-4 divide-y divide-neutral-800">
            {queue.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">{q.id} — {q.type}</p>
                  <p className="text-xs text-neutral-400">{q.location} · {q.age} ago</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase ${q.severity === "critical" ? "bg-red-600" : "bg-amber-500 text-black"}`}>
                  {q.severity}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Workplace Roll-Call</h2>
            <p className="text-xs text-neutral-400">{safeCount}/{people.length} safe{helpCount > 0 ? ` · ${helpCount} need help` : ""}</p>
          </div>
          <ul className="mt-4 space-y-2">
            {people.map((p) => (
              <li key={p.name} className="flex items-center justify-between gap-2 rounded-lg border border-neutral-800 px-3 py-2">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-neutral-500">{p.site}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setChecks((c) => ({ ...c, [p.name]: "safe" }))} className={`rounded-md px-3 py-1.5 text-xs font-bold ${checks[p.name] === "safe" ? "bg-emerald-600" : "bg-neutral-800 hover:bg-emerald-700"}`}>Safe</button>
                  <button onClick={() => setChecks((c) => ({ ...c, [p.name]: "help" }))} className={`rounded-md px-3 py-1.5 text-xs font-bold ${checks[p.name] === "help" ? "bg-red-600" : "bg-neutral-800 hover:bg-red-800"}`}>Needs help</button>
                </div>
              </li>
            ))}
          </ul>
          <button className="mt-4 w-full rounded-lg border border-amber-600 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-400 hover:bg-amber-500/20">
            Broadcast evacuation drill to all sites
          </button>
        </section>
      </div>
    </div>
  );
}
