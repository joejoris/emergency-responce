"use client";

import { useState } from "react";

type Kind = "hospital" | "pharmacy" | "police";
const KINDS: { kind: Kind; label: string; query: string }[] = [
  { kind: "hospital", label: "Nearest hospitals", query: "hospital" },
  { kind: "pharmacy", label: "Nearest pharmacies", query: "pharmacy" },
  { kind: "police", label: "Nearest police stations", query: "police station" },
];

export default function NearbyHelp() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported on this device.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-left">
      <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">Find nearby help</h2>
      {!coords ? (
        <>
          <button
            onClick={locate}
            disabled={loading}
            className="mt-2 w-full rounded-lg border border-sky-700 bg-sky-950 px-4 py-2 font-semibold text-sky-300 hover:bg-sky-900 disabled:opacity-50"
          >
            {loading ? "Locating…" : "Use my location"}
          </button>
          {error && <p className="mt-2 text-xs text-amber-400">{error}</p>}
        </>
      ) : (
        <ul className="mt-2 space-y-2">
          {KINDS.map(({ kind, label, query }) => (
            <li key={kind}>
              <a
                className="block rounded-lg border border-neutral-800 px-3 py-2 text-sm font-semibold text-sky-300 hover:bg-neutral-800"
                href={`https://www.google.com/maps/search/${encodeURIComponent(query)}/@${coords.lat},${coords.lng},15z`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label} →
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
