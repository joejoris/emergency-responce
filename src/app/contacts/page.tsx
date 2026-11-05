"use client";

import { useEffect, useState } from "react";
import { loadContacts, saveContacts, type EmergencyContact } from "@/lib/contacts";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [form, setForm] = useState({ name: "", relation: "", phone: "" });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setContacts(loadContacts());
    setLoaded(true);
  }, []);

  const update = (next: EmergencyContact[]) => {
    setContacts(next);
    saveContacts(next);
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    update([
      ...contacts,
      { id: crypto.randomUUID(), name: form.name.trim(), relation: form.relation.trim() || "Contact", phone: form.phone.trim() },
    ]);
    setForm({ name: "", relation: "", phone: "" });
  };

  const remove = (id: string) => update(contacts.filter((c) => c.id !== id));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-black">Emergency Contacts</h1>
      <p className="mt-1 text-sm text-neutral-400">
        These people are notified when you trigger an SOS. Stored on this device only.
      </p>

      <form onSubmit={add} className="mt-6 grid gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <input aria-label="Name" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="min-w-0 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" />
        <input aria-label="Relationship" placeholder="Relation (e.g. spouse)" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} className="min-w-0 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" />
        <input aria-label="Phone" type="tel" placeholder="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="min-w-0 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" />
        <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 font-bold hover:bg-red-500">Add</button>
      </form>

      <ul className="mt-6 space-y-3">
        {loaded && contacts.length === 0 && (
          <li className="rounded-xl border border-dashed border-neutral-800 p-6 text-center text-neutral-500">
            No contacts yet — add at least one so SOS can reach the right people.
          </li>
        )}
        {contacts.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div>
              <p className="font-bold">{c.name} <span className="text-xs font-normal text-neutral-500">· {c.relation}</span></p>
              <a href={`tel:${c.phone}`} className="text-sm text-sky-400 hover:underline">{c.phone}</a>
            </div>
            <button onClick={() => remove(c.id)} aria-label={`Remove ${c.name}`} className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-red-400">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
