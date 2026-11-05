import { getSupabase } from "@/lib/supabase";

export type Storage = "cloud" | "local";

export type Contact = { id: string; name: string; relation: string; phone: string };
export type FamilyMember = { id: string; name: string; status: "unknown" | "safe" | "help" };
export type Incident = {
  id: string;
  type: string;
  severity: string;
  description: string;
  lat: number | null;
  lng: number | null;
  status: string;
  created_at: string;
};

// ── localStorage fallbacks ──────────────────────────────────
const LKEY = {
  contacts: "er_contacts",
  family: "er_family",
  history: "er_sos_history",
};

function readLocal<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function writeLocal<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(items));
}

async function currentUser() {
  const sb = getSupabase();
  if (!sb) return { sb: null, user: null };
  const { data } = await sb.auth.getUser();
  return { sb, user: data.user ?? null };
}

// ── Contacts ────────────────────────────────────────────────
export async function listContacts(): Promise<{ items: Contact[]; storage: Storage }> {
  const { sb, user } = await currentUser();
  if (sb && user) {
    const { data, error } = await sb
      .from("emergency_contacts")
      .select("id, name, relation, phone")
      .order("created_at");
    if (!error && data) return { items: data as Contact[], storage: "cloud" };
  }
  return { items: readLocal<Contact>(LKEY.contacts), storage: "local" };
}

export async function addContact(input: Omit<Contact, "id">): Promise<{ items: Contact[]; storage: Storage }> {
  const { sb, user } = await currentUser();
  if (sb && user) {
    const { error } = await sb
      .from("emergency_contacts")
      .insert({ owner_id: user.id, name: input.name, relation: input.relation, phone: input.phone });
    if (!error) return listContacts();
  }
  const items = [...readLocal<Contact>(LKEY.contacts), { id: crypto.randomUUID(), ...input }];
  writeLocal(LKEY.contacts, items);
  return { items, storage: "local" };
}

export async function deleteContact(id: string): Promise<{ items: Contact[]; storage: Storage }> {
  const { sb, user } = await currentUser();
  if (sb && user) {
    const { error } = await sb.from("emergency_contacts").delete().eq("id", id);
    if (!error) return listContacts();
  }
  const items = readLocal<Contact>(LKEY.contacts).filter((c) => c.id !== id);
  writeLocal(LKEY.contacts, items);
  return { items, storage: "local" };
}

// ── Family check-in ─────────────────────────────────────────
export async function listFamily(): Promise<{ items: FamilyMember[]; storage: Storage }> {
  const { sb, user } = await currentUser();
  if (sb && user) {
    const { data, error } = await sb
      .from("family_members")
      .select("id, name, status")
      .order("created_at");
    if (!error && data) return { items: data as FamilyMember[], storage: "cloud" };
  }
  return { items: readLocal<FamilyMember>(LKEY.family), storage: "local" };
}

export async function addFamilyMember(name: string): Promise<{ items: FamilyMember[]; storage: Storage }> {
  const { sb, user } = await currentUser();
  if (sb && user) {
    const { error } = await sb.from("family_members").insert({ owner_id: user.id, name });
    if (!error) return listFamily();
  }
  const items = [...readLocal<FamilyMember>(LKEY.family), { id: crypto.randomUUID(), name, status: "unknown" as const }];
  writeLocal(LKEY.family, items);
  return { items, storage: "local" };
}

export async function setFamilyStatus(id: string, status: FamilyMember["status"]): Promise<{ items: FamilyMember[]; storage: Storage }> {
  const { sb, user } = await currentUser();
  if (sb && user) {
    const { error } = await sb
      .from("family_members")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) return listFamily();
  }
  const items = readLocal<FamilyMember>(LKEY.family).map((m) => (m.id === id ? { ...m, status } : m));
  writeLocal(LKEY.family, items);
  return { items, storage: "local" };
}

export async function removeFamilyMember(id: string): Promise<{ items: FamilyMember[]; storage: Storage }> {
  const { sb, user } = await currentUser();
  if (sb && user) {
    const { error } = await sb.from("family_members").delete().eq("id", id);
    if (!error) return listFamily();
  }
  const items = readLocal<FamilyMember>(LKEY.family).filter((m) => m.id !== id);
  writeLocal(LKEY.family, items);
  return { items, storage: "local" };
}

export async function resetFamily(): Promise<{ items: FamilyMember[]; storage: Storage }> {
  const { sb, user } = await currentUser();
  if (sb && user) {
    const { error } = await sb
      .from("family_members")
      .update({ status: "unknown", updated_at: new Date().toISOString() })
      .eq("owner_id", user.id);
    if (!error) return listFamily();
  }
  const items = readLocal<FamilyMember>(LKEY.family).map((m) => ({ ...m, status: "unknown" as const }));
  writeLocal(LKEY.family, items);
  return { items, storage: "local" };
}

// ── Incidents ───────────────────────────────────────────────
export async function listIncidents(limit = 20): Promise<{ items: Incident[]; storage: Storage }> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("incidents")
      .select("id, type, severity, description, lat, lng, status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!error && data && data.length > 0) return { items: data as Incident[], storage: "cloud" };
  }
  return { items: [], storage: "local" };
}

export async function createIncident(input: {
  type: string;
  severity: string;
  description: string;
  lat: number | null;
  lng: number | null;
}): Promise<{ ok: boolean; storage: Storage; error?: string }> {
  const { sb, user } = await currentUser();
  if (sb) {
    const { error } = await sb.from("incidents").insert({
      reporter_id: user?.id ?? null,
      type: input.type,
      severity: input.severity,
      description: input.description,
      lat: input.lat,
      lng: input.lng,
    });
    if (!error) return { ok: true, storage: "cloud" };
    return { ok: false, storage: "cloud", error: error.message };
  }
  return { ok: true, storage: "local" };
}

// ── SOS events ──────────────────────────────────────────────
export type SosEvent = { id: string; time: string; lat: number | null; lng: number | null };

export async function logSosEvent(input: { lat: number | null; lng: number | null; accuracy?: number | null }): Promise<{ items: SosEvent[]; storage: Storage }> {
  const { sb, user } = await currentUser();
  const local: SosEvent = {
    id: crypto.randomUUID(),
    time: new Date().toISOString(),
    lat: input.lat,
    lng: input.lng,
  };
  const items = [local, ...readLocal<SosEvent>(LKEY.history)].slice(0, 20);
  writeLocal(LKEY.history, items);

  if (sb && user) {
    await sb.from("sos_events").insert({
      user_id: user.id,
      status: "active",
      lat: input.lat,
      lng: input.lng,
      accuracy_m: input.accuracy ?? null,
    });
    return { items, storage: "cloud" };
  }
  return { items, storage: "local" };
}

export async function resolveSosEvent(id: string) {
  const { sb, user } = await currentUser();
  if (sb && user) {
    await sb.from("sos_events").update({ status: "cancelled", resolved_at: new Date().toISOString() }).eq("id", id);
  }
}
