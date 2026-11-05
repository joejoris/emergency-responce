"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Account created. If email confirmation is enabled, check your inbox before signing in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/");
    }
    setBusy(false);
  };

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
    setUserEmail(null);
    router.refresh();
  };

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-3xl font-black">Account</h1>
        <div className="mt-4 rounded-xl border border-amber-700 bg-amber-950/40 p-5 text-sm text-amber-200">
          <p className="font-bold">Supabase is not configured yet.</p>
          <p className="mt-2">To enable accounts and database storage:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Create a project at supabase.com</li>
            <li>Run <code className="rounded bg-black/40 px-1">supabase/schema.sql</code> in the SQL editor</li>
            <li>Set <code className="rounded bg-black/40 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="rounded bg-black/40 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="rounded bg-black/40 px-1">.env.local</code></li>
            <li>Restart the dev server</li>
          </ol>
          <p className="mt-2">Everything else keeps working in local demo mode.</p>
        </div>
      </div>
    );
  }

  if (userEmail) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-3xl font-black">Account</h1>
        <p className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          Signed in as <strong>{userEmail}</strong>
        </p>
        <button onClick={signOut} className="mt-4 w-full rounded-lg border border-neutral-700 px-4 py-3 font-semibold hover:bg-neutral-800">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-black">{mode === "signin" ? "Sign in" : "Create account"}</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Sign in to sync contacts, check-ins, and incidents across devices.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <label className="block text-sm font-semibold">Email
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" />
        </label>
        <label className="block text-sm font-semibold">Password
          <input type="password" required minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" />
        </label>
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold hover:bg-red-500 disabled:opacity-50">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        {message && <p role="status" className="text-sm text-emerald-400">{message}</p>}
      </form>
      <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 text-sm text-sky-400 hover:underline">
        {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
