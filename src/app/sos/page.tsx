"use client";

import { useEffect, useRef, useState } from "react";
import { loadContacts, type EmergencyContact } from "@/lib/contacts";
import { logSosEvent, resolveSosEvent, type SosEvent } from "@/lib/db";
import NearbyHelp from "@/components/NearbyHelp";

type SosState = "idle" | "arming" | "active";

function loadLocalHistory(): SosEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem("er_sos_history") ?? "[]") as SosEvent[];
  } catch {
    return [];
  }
}

function startSiren(): () => void {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 700;
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.8;
  lfoGain.gain.value = 250;
  lfo.connect(lfoGain).connect(osc.frequency);
  lfo.start();
  return () => {
    try { osc.stop(); lfo.stop(); } catch { /* already stopped */ }
    void ctx.close();
  };
}

export default function SosPage() {
  const [state, setState] = useState<SosState>("idle");
  const [countdown, setCountdown] = useState(3);
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [history, setHistory] = useState<SosEvent[]>([]);
  const activeEventId = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopSiren = useRef<(() => void) | null>(null);

  useEffect(() => {
    setContacts(loadContacts());
    setHistory(loadLocalHistory());
  }, []);

  useEffect(() => {
    if (state !== "arming") return;
    setCountdown(3);
    timer.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timer.current) clearInterval(timer.current);
          setState("active");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [state]);

  useEffect(() => {
    if (state !== "active") return;
    stopSiren.current = startSiren();
    if ("geolocation" in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setGeoError(null);
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        },
        (err) => setGeoError(err.message),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
      return () => {
        navigator.geolocation.clearWatch(id);
        stopSiren.current?.();
        stopSiren.current = null;
      };
    }
    return () => {
      stopSiren.current?.();
      stopSiren.current = null;
    };
  }, [state]);

  // Log once when transitioning into "active"
  const loggedRef = useRef(false);
  useEffect(() => {
    if (state === "active" && !loggedRef.current) {
      loggedRef.current = true;
      void logSosEvent({ lat: location?.lat ?? null, lng: location?.lng ?? null, accuracy: location?.accuracy ?? null }).then(({ items }) => {
        activeEventId.current = items[0]?.id ?? null;
        setHistory(items);
      });
    }
    if (state === "idle") loggedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const cancel = () => {
    if (timer.current) clearInterval(timer.current);
    stopSiren.current?.();
    stopSiren.current = null;
    if (activeEventId.current) void resolveSosEvent(activeEventId.current);
    activeEventId.current = null;
    setState("idle");
    setLocation(null);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-10 text-center">
      <h1 className="text-3xl font-black">Personal SOS</h1>

      {state === "idle" && (
        <>
          <p className="text-neutral-400">
            Tap and hold for 3 seconds. Your live location will be shared with emergency services and your trusted contacts, with a siren.
          </p>
          <button
            onPointerDown={() => setState("arming")}
            onPointerUp={cancel}
            onPointerLeave={cancel}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setState("arming"); }}
            className="grid h-56 w-56 touch-none select-none place-items-center rounded-full bg-red-600 text-5xl font-black shadow-[0_0_80px_rgba(239,68,68,0.6)] transition hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-red-300 active:scale-95"
            aria-label="Activate SOS. Press and hold for 3 seconds."
          >
            SOS
          </button>
          <a href="tel:112" className="rounded-lg border border-red-800 bg-red-950 px-6 py-3 font-bold text-red-300 hover:bg-red-900">
            Call 112 / 911 now
          </a>
          <p className="text-sm text-neutral-500">
            {contacts.length > 0
              ? `${contacts.length} emergency contact${contacts.length === 1 ? "" : "s"} on file — manage them in Contacts.`
              : "No emergency contacts yet — add some in Contacts."}
          </p>
        </>
      )}

      {state === "arming" && (
        <>
          <p className="text-xl text-amber-400">Activating in…</p>
          <div className="grid h-48 w-48 place-items-center rounded-full border-8 border-amber-400 text-8xl font-black">
            {countdown}
          </div>
          <button onClick={cancel} className="rounded-lg bg-neutral-800 px-8 py-4 text-lg font-bold hover:bg-neutral-700">
            Cancel
          </button>
        </>
      )}

      {state === "active" && (
        <>
          <div role="alert" aria-live="assertive" className="w-full animate-pulse rounded-xl border border-red-500 bg-red-950 p-4 text-red-200 motion-reduce:animate-none">
            SOS ACTIVE — siren sounding, help is being contacted. Stay on the line if you call 112/911.
          </div>
          <p className="text-lg font-semibold">
            {contacts.length > 0
              ? `${contacts.length} emergency contact${contacts.length === 1 ? "" : "s"} notified`
              : "No emergency contacts on file"}
          </p>
          {location ? (
            <p className="rounded-lg bg-neutral-900 px-4 py-3 font-mono text-sm">
              Live location: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              <br />±{Math.round(location.accuracy)} m accuracy
            </p>
          ) : geoError ? (
            <p className="text-amber-400">Location unavailable: {geoError}</p>
          ) : (
            <p className="text-neutral-400">Acquiring GPS…</p>
          )}
          <a href="tel:112" className="w-full rounded-lg bg-red-600 px-6 py-4 text-xl font-black hover:bg-red-500">
            CALL 112 / 911
          </a>
          <button onClick={cancel} className="w-full rounded-lg border border-neutral-700 px-6 py-3 text-neutral-300 hover:bg-neutral-800">
            I am safe — cancel alert &amp; siren
          </button>
        </>
      )}

      <div className="w-full"><NearbyHelp /></div>

      {history.length > 0 && (
        <section className="w-full text-left">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">SOS history</h2>
          <ul className="mt-2 divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-900">
            {history.slice(0, 5).map((h) => (
              <li key={h.id} className="px-4 py-2 text-xs text-neutral-400">
                {new Date(h.time).toLocaleString()}
                {h.lat != null && h.lng != null && (
                  <> · <a className="text-sky-400 hover:underline" href={`https://www.google.com/maps?q=${h.lat},${h.lng}`} target="_blank" rel="noopener noreferrer">map</a></>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
