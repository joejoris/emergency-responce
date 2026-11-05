"use client";

import { useEffect, useState } from "react";
import NearbyHelp from "@/components/NearbyHelp";
import { createIncident, listIncidents, type Incident, type Storage } from "@/lib/db";

const demoIncidents: Incident[] = [
  { id: "demo-1", type: "Traffic accident", severity: "high", description: "Two-car collision, minor injuries reported.", lat: null, lng: null, status: "assigned", created_at: new Date(Date.now() - 10 * 60_000).toISOString() },
  { id: "demo-2", type: "Fire", severity: "critical", description: "Smoke from warehouse roof, no visible flames.", lat: null, lng: null, status: "triaged", created_at: new Date(Date.now() - 25 * 60_000).toISOString() },
  { id: "demo-3", type: "Medical", severity: "high", description: "Elderly person collapsed at bus stop.", lat: null, lng: null, status: "reported", created_at: new Date(Date.now() - 40 * 60_000).toISOString() },
];

function relative(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [storage, setStorage] = useState<Storage>("local");
  const [form, setForm] = useState({ type: "Medical", severity: "high", description: "", location: "", lat: null as number | null, lng: null as number | null });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listIncidents().then(({ items, storage }) => {
      setStorage(storage);
      setIncidents(storage === "cloud" ? items : items.length ? items : demoIncidents);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.location.trim()) return;
    setError(null);
    const res = await createIncident({
      type: form.type,
      severity: form.severity,
      description: form.description,
      lat: form.lat,
      lng: form.lng,
    });
    if (!res.ok) {
      setError(res.error ?? "Could not submit the report. Try again.");
      return;
    }
    const created: Incident = {
      id: crypto.randomUUID(),
      type: form.type,
      severity: form.severity,
      description: form.description,
      lat: form.lat,
      lng: form.lng,
      status: "reported",
      created_at: new Date().toISOString(),
    };
    setIncidents((prev) => [created, ...prev.filter((i) => !i.id.startsWith("demo-"))].slice(0, 20));
    setStorage(res.storage);
    setForm({ type: "Medical", severity: "high", description: "", location: "", lat: null, lng: null });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm((f) => ({
        ...f,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        location: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
      }));
    });
  };

  return (
    <div className="mx-auto max-w-6xl gap-8 px-4 py-10 lg:grid lg:grid-cols-2">
      <section>
        <h1 className="text-3xl font-black">Report an Incident</h1>
        <p className="mt-1 text-sm text-neutral-400">For emergencies in progress, call 112/911 — don&apos;t wait to submit this form.</p>
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
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value, lat: null, lng: null })} placeholder="Address or coordinates" className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" />
              <button type="button" onClick={useMyLocation} className="shrink-0 rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800">Use GPS</button>
            </div>
          </label>
          <label className="block text-sm font-semibold">Description
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What happened? Injuries? Hazards?" className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" />
          </label>
          <button type="submit" className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold hover:bg-red-500">Submit report</button>
          {submitted && <p role="status" className="text-sm text-emerald-400">Report received{storage === "cloud" ? " and stored in the database" : ""}. Responders have been notified.</p>}
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        </form>
      </section>

      <section className="mt-10 lg:mt-0">
        <div className="mb-6"><NearbyHelp /></div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-2xl font-bold">Live Community Incidents</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${storage === "cloud" ? "bg-emerald-900 text-emerald-300" : "bg-neutral-800 text-neutral-400"}`}>
            {storage === "cloud" ? "Live database" : "Demo data"}
          </span>
        </div>
        <ul className="mt-4 space-y-3">
          {incidents.length === 0 && (
            <li className="rounded-xl border border-dashed border-neutral-800 p-6 text-center text-neutral-500">
              No incidents reported yet.
            </li>
          )}
          {incidents.map((i) => (
            <li key={i.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">{i.type}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${i.severity === "critical" ? "bg-red-600" : i.severity === "high" ? "bg-amber-500 text-black" : "bg-neutral-700"}`}>{i.severity}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-300">{i.description}</p>
              <p className="mt-2 text-xs text-neutral-500">
                {i.lat != null && i.lng != null ? (
                  <a className="text-sky-400 hover:underline" href={`https://www.google.com/maps?q=${i.lat},${i.lng}`} target="_blank" rel="noopener noreferrer">
                    {i.lat.toFixed(4)}, {i.lng.toFixed(4)}
                  </a>
                ) : (
                  "Reported without GPS"
                )}
                {" · "}{relative(i.created_at)} · status: {i.status}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
