import Link from "next/link";
import { notFound } from "next/navigation";
import { firstAidTopics } from "@/lib/firstaid";

export function generateStaticParams() {
  return firstAidTopics.map((t) => ({ id: t.id }));
}

export default async function FirstAidTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topic = firstAidTopics.find((t) => t.id === id);
  if (!topic) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/first-aid" className="text-sm text-neutral-400 hover:text-white">← All topics</Link>
      <h1 className="mt-3 text-3xl font-black">{topic.title}</h1>
      <p className="mt-1 text-neutral-400">{topic.summary}</p>
      <ol className="mt-6 space-y-3">
        {topic.steps.map((step, i) => (
          <li key={i} className="flex gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-600 font-bold">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <a href="tel:112" className="mt-6 block rounded-lg bg-red-600 px-6 py-4 text-center text-xl font-black hover:bg-red-500">
        CALL 112 / 911
      </a>
      <p className="mt-4 text-xs text-neutral-500">
        Guidance is general first-aid education, medically reviewed summaries only — it does not replace professional medical advice or training.
      </p>
    </div>
  );
}
