import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/sos", label: "SOS" },
  { href: "/first-aid", label: "First Aid" },
  { href: "/incidents", label: "Report" },
  { href: "/contacts", label: "Contacts" },
  { href: "/family", label: "Family" },
  { href: "/dashboard", label: "Responder" },
  { href: "/login", label: "Account" },
  { href: "/settings", label: "Settings" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-red-900/30 bg-red-950 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-extrabold tracking-tight">
          <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-600 text-lg font-black">SOS</span>
          <span className="hidden md:inline">Emergency Response</span>
        </Link>
        <nav aria-label="Main" className="flex min-w-0 flex-wrap items-center justify-end gap-1 text-xs sm:gap-2 sm:text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap rounded px-2 py-1.5 hover:bg-red-800/60 focus:outline-none focus:ring-2 focus:ring-white">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
