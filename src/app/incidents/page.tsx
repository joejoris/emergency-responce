"use client";

import { useState } from "react";
import NearbyHelp from "@/components/NearbyHelp";

type Incident = {
  id: number;
  type: string;
  description: string;
  severity: string;
  location: string;
  time: string;
  status: "reported" | "triaged" | "assigned" | "resolved";
};

const initialIncidents: Incident[] = [
  { id: 1, type: "Traffic accident", description: "Two-car collision, minor injuries reported.", severity: "high", location: "A4 near Junction 12", time: "10 min ago", status: "assigned" },
  { id: 2, type: "Fire", description: "Smoke from warehouse roof, no visible flames.", severity: "critical", location: "Industrial Park East, Unit 7", time: "25 min ago", status: "triaged" },
  { id: 3, type: "Medical", description: "Elderly person collapsed at bus stop.", severity: "high", location: "Central Station, Platform 2", time: "40 min ago", status: "reported" },
];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [form, setForm] = useState({ type: "Medical", severity: "high", description: "", location: "" });
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.location.trim()) return;
    setIncidents((prev) => [
      { id: Date.now(), ...form, time: "just now", status: "reported" },
      ...prev,
    ]);
    setForm({ type: "Medical", severity: "high", description: "", location: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      setForm((f) => ({ ...f, location: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}` }))
    );
  };

  return (
    <div className="mx-auto max-w-6xl gap-8 px-4 py-10 lg:grid lg:grid-cols-2">
      <section>
        <h1 className="text-3xl font-black">Report an Incident</h1>
        <p className="mt-1 text-sm text-neutral-400">For emergencies in progress, call 112/911 — don't wait to submit this form.</p>
        <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <label className="block text-sm font-semibold">Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2">
              {["Medical", "Fire", "Traffic accident", "Crime in progress", "Flood", "Other"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold">Severity
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2">
              <option value="critical">Critical (life at risk)</option>
              <option value="high">High (urgent)</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">Location
            <div className="mt-1 flex gap-2">
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Address or coordinates" className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" />
              <button type="button" onClick={useMyLocation} className="shrink-0 rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800">Use GPS</button>
            </div>
          </label>
          <label className="block text-sm font-semibold">Description
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What happened? Injuries? Hazards?" className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" />
          </label>
          <button type="submit" className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold hover:bg-red-500">Submit report</button>
          {submitted && <p role="status" className="text-sm text-emerald-400">Report received. Responders have been notified.</p>}
        </form>
      </section>

      <section className="mt-10 lg:mt-0">
        <div className="mb-6"><NearbyHelp /></div>
        <h2 className="text-2xl font-bold">Live Community Incidents</h2>
        <ul className="mt-4 space-y-3">
          {incidents.map((i) => (
            <li key={i.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">{i.type}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${i.severity === "critical" ? "bg-red-600" : i.severity === "high" ? "bg-amber-500 text-black" : "bg-neutral-700"}`}>{i.severity}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-300">{i.description}</p>
              <p className="mt-2 text-xs text-neutral-500">{i.location} · {i.time} · status: {i.status}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
