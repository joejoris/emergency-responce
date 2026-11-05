"use client";

import { useState } from "react";
import Link from "next/link";
import { firstAidTopics } from "@/lib/firstaid";

const severityColor: Record<string, string> = {
  critical: "bg-red-600",
  urgent: "bg-amber-500 text-black",
  minor: "bg-emerald-600",
};

export default function FirstAidPage() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = q
    ? firstAidTopics.filter((t) =>
        [t.title, t.summary, t.severity, ...t.steps].join(" ").toLowerCase().includes(q)
      )
    : firstAidTopics;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-black">First-Aid Guidance</h1>
      <p className="mt-1 text-neutral-400">
        Life-saving steps for common emergencies. In a serious situation call 112/911 first.
      </p>
      <label className="mt-4 block">
        <span className="sr-only">Search first-aid topics</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symptoms or situations… (e.g. bleeding, burns, choking)"
          className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
        />
      </label>
      {results.length === 0 ? (
        <p className="mt-8 text-center text-neutral-500">No topics match “{query}”. In an emergency, call 112/911.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {results.map((t) => (
            <Link
              key={t.id}
              href={`/first-aid/${t.id}`}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold uppercase ${severityColor[t.severity]}`}>
                {t.severity}
              </span>
              <h2 className="mt-2 text-xl font-bold">{t.title}</h2>
              <p className="mt-1 text-sm text-neutral-400">{t.summary}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
