export type EmergencyContact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
};

const KEY = "er_contacts";

export function loadContacts(): EmergencyContact[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as EmergencyContact[];
  } catch {
    return [];
  }
}

export function saveContacts(contacts: EmergencyContact[]) {
  window.localStorage.setItem(KEY, JSON.stringify(contacts));
}
