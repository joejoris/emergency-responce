import Link from "next/link";

export const metadata = { title: "Offline — Emergency Response" };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-3xl font-black">You&apos;re offline</h1>
      <p className="text-neutral-400">
        No internet connection. Cached pages may still work. In a life-threatening emergency,
        use your phone&apos;s emergency call function — it works without data.
      </p>
      <a href="tel:112" className="w-full rounded-lg bg-red-600 px-6 py-4 text-xl font-black hover:bg-red-500">
        CALL 112 / 911
      </a>
      <Link href="/first-aid" className="w-full rounded-lg border border-neutral-700 px-6 py-3 font-semibold hover:bg-neutral-800">
        Open cached First Aid
      </Link>
      <Link href="/" className="text-sm text-sky-400 hover:underline">Try home page again</Link>
    </div>
  );
}
