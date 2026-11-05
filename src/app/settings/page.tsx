"use client";

import { useEffect, useState } from "react";

const KEYS = ["er_contacts", "er_family", "er_sos_history"];

export default function SettingsPage() {
  const [counts, setCounts] = useState({ contacts: 0, family: 0, history: 0 });
  const [cleared, setCleared] = useState(false);
  const [installed, setInstalled] = useState(false);

  const refresh = () => {
    const read = (k: string) => {
      try { return JSON.parse(localStorage.getItem(k) ?? "[]").length as number; } catch { return 0; }
    };
    setCounts({ contacts: read("er_contacts"), family: read("er_family"), history: read("er_sos_history") });
  };

  useEffect(() => {
    refresh();
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  const clearAll = () => {
    KEYS.forEach((k) => localStorage.removeItem(k));
    refresh();
    setCleared(true);
    setTimeout(() => setCleared(false), 4000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-black">Settings &amp; Privacy</h1>
        <p className="mt-1 text-sm text-neutral-400">All data is stored locally on this device. Nothing leaves your browser.</p>
      </div>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="text-lg font-bold">Location sharing</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Location is requested only while an SOS is active (SOS-only scope). It is never tracked in the
          background or shared without an active alert.
        </p>
        <p className="mt-2 rounded-lg bg-neutral-950 px-3 py-2 text-xs text-neutral-500">
          Scope: <strong className="text-neutral-300">SOS-only</strong> · continuous on-shift tracking is not enabled.
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="text-lg font-bold">Stored data</h2>
        <ul className="mt-2 space-y-1 text-sm text-neutral-300">
          <li>Emergency contacts: <strong>{counts.contacts}</strong></li>
          <li>Household members: <strong>{counts.family}</strong></li>
          <li>SOS history entries: <strong>{counts.history}</strong></li>
        </ul>
        <p className="mt-2 text-xs text-neutral-500">SOS history is capped at the 20 most recent activations.</p>
        <button onClick={clearAll} className="mt-4 rounded-lg border border-red-800 bg-red-950 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-900">
          Delete all local data
        </button>
        {cleared && <p role="status" className="mt-2 text-sm text-emerald-400">All local data deleted.</p>}
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="text-lg font-bold">Install &amp; offline</h2>
        <p className="mt-1 text-sm text-neutral-400">
          {installed
            ? "Running as an installed app. The offline page and first-aid guidance are cached."
            : "Install this app for quicker access: use your browser's menu → “Install app” / “Add to Home Screen”."}
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          A service worker caches key pages. If you are offline, emergency calling still works — it does not need data.
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="text-lg font-bold">Medical disclaimer</h2>
        <p className="mt-1 text-sm text-neutral-400">
          First-aid guidance is general educational content and does not replace professional medical
          advice, training, or emergency services. Call 112/911 in a life-threatening emergency.
        </p>
      </section>
    </div>
  );
}
