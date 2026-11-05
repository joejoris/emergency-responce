import Link from "next/link";

const modules = [
  { href: "/sos", title: "Personal SOS", desc: "One-tap panic alert with live GPS to your emergency contacts.", accent: "bg-red-600" },
  { href: "/first-aid", title: "First Aid", desc: "Offline step-by-step life-saving guidance.", accent: "bg-amber-500" },
  { href: "/incidents", title: "Report an Incident", desc: "Crowd-sourced community incident reporting with location.", accent: "bg-sky-600" },
  { href: "/dashboard", title: "Responder Console", desc: "Triage queue, assignments and worksite roll-call for responders.", accent: "bg-emerald-600" },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl border border-red-800/40 bg-gradient-to-br from-red-950 via-red-900/40 to-neutral-950 p-8 text-center sm:p-14">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Emergency Response</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
          Help in <span className="text-red-500">one tap</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-neutral-300">
          SOS alerts with live location, first-aid guidance, and community incident reporting —
          built for individuals, workplaces, and first responders.
        </p>
        <Link
          href="/sos"
          className="mt-8 inline-flex h-40 w-40 items-center justify-center rounded-full bg-red-600 text-3xl font-black shadow-[0_0_60px_rgba(239,68,68,0.5)] transition hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-red-300 sm:h-48 sm:w-48"
        >
          SOS
        </Link>
        <p className="mt-4 text-xs text-neutral-400">Hold nothing back — in an emergency, call 112/911 first.</p>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <span className={`mb-4 inline-block h-2 w-16 rounded-full ${m.accent}`} aria-hidden />
            <h2 className="text-xl font-bold group-hover:text-white">{m.title}</h2>
            <p className="mt-1 text-sm text-neutral-400">{m.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
