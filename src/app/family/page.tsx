"use client";

import { useEffect, useState } from "react";
import {
  addFamilyMember,
  listFamily,
  removeFamilyMember,
  resetFamily,
  setFamilyStatus,
  type FamilyMember,
  type Storage,
} from "@/lib/db";

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [storage, setStorage] = useState<Storage>("local");
  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    listFamily().then(({ items, storage }) => {
      setMembers(items);
      setStorage(storage);
      setLoaded(true);
    });
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await addFamilyMember(name.trim());
    setMembers(res.items);
    setStorage(res.storage);
    setName("");
  };

  const setStatus = async (id: string, status: FamilyMember["status"]) => {
    const res = await setFamilyStatus(id, status);
    setMembers(res.items);
    setStorage(res.storage);
  };

  const reset = async () => {
    const res = await resetFamily();
    setMembers(res.items);
    setStorage(res.storage);
  };

  const remove = async (id: string) => {
    const res = await removeFamilyMember(id);
    setMembers(res.items);
    setStorage(res.storage);
  };

  const safe = members.filter((m) => m.status === "safe").length;
  const help = members.filter((m) => m.status === "help").length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Family Check-In</h1>
          <p className="mt-1 text-sm text-neutral-400">During an emergency, mark each household member safe or needing help.</p>
        </div>
        {members.length > 0 && (
          <button onClick={reset} className="shrink-0 rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800">
            Reset all
          </button>
        )}
      </div>
      <p className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${storage === "cloud" ? "bg-emerald-900 text-emerald-300" : "bg-neutral-800 text-neutral-400"}`}>
        {storage === "cloud" ? "Synced to cloud" : "Saved on this device"}
      </p>

      {members.length > 0 && (
        <p className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm">
          <span className="font-bold text-emerald-400">{safe} safe</span>
          {" · "}
          <span className={help > 0 ? "font-bold text-red-400" : "text-neutral-400"}>{help} need help</span>
          {" · "}
          <span className="text-neutral-400">{members.length - safe - help} unmarked</span>
        </p>
      )}

      <form onSubmit={add} className="mt-4 flex gap-2">
        <input aria-label="Household member name" placeholder="Add household member…" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" />
        <button type="submit" className="shrink-0 rounded-lg bg-red-600 px-4 py-2 font-bold hover:bg-red-500">Add</button>
      </form>

      <ul className="mt-4 space-y-2">
        {loaded && members.length === 0 && (
          <li className="rounded-xl border border-dashed border-neutral-800 p-6 text-center text-neutral-500">
            No household members yet.
          </li>
        )}
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <span className="font-medium">
              <span aria-hidden className="mr-2">{m.status === "safe" ? "🟢" : m.status === "help" ? "🔴" : "⚪"}</span>
              {m.name}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setStatus(m.id, "safe")} aria-pressed={m.status === "safe"} className={`rounded-md px-3 py-1.5 text-xs font-bold ${m.status === "safe" ? "bg-emerald-600" : "bg-neutral-800 hover:bg-emerald-800"}`}>Safe</button>
              <button onClick={() => setStatus(m.id, "help")} aria-pressed={m.status === "help"} className={`rounded-md px-3 py-1.5 text-xs font-bold ${m.status === "help" ? "bg-red-600" : "bg-neutral-800 hover:bg-red-800"}`}>Needs help</button>
              <button onClick={() => remove(m.id)} aria-label={`Remove ${m.name}`} className="rounded-md px-2 py-1.5 text-xs text-neutral-500 hover:text-red-400">✕</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
