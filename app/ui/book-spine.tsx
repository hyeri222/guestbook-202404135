import Link from "next/link";
import type { Entry } from "@/lib/entries";

// 방명록 글 한 편이 책 한 권. 같은 글은 늘 같은 모양이 되도록 id로 고른다.
const COLORS = ["bg-rose-200", "bg-amber-200", "bg-lime-200", "bg-sky-200", "bg-violet-200", "bg-orange-200", "bg-teal-200", "bg-pink-200"];
const WIDTHS = ["w-[92%]", "w-[84%]", "w-[96%]", "w-[78%]", "w-[88%]"];
const TILTS = ["-rotate-1", "rotate-0", "rotate-1", "rotate-[0.5deg]", "-rotate-[0.5deg]"];
const HEIGHTS = ["h-14", "h-16", "h-12", "h-[60px]"];

const pick = <T,>(items: T[], id: number, salt: number) => items[(id * 7 + salt * 13) % items.length];

export function BookSpine({ entry }: { entry: Entry }) {
  const shape = [pick(COLORS, entry.id, 0), pick(WIDTHS, entry.id, 1), pick(TILTS, entry.id, 2), pick(HEIGHTS, entry.id, 3)].join(" ");

  return (
    <li className="flex justify-center">
      <Link
        href={`/entries/${entry.id}`}
        className={`${shape} relative flex items-center gap-3 rounded-md px-5 text-stone-800 shadow-[0_2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_0_rgba(0,0,0,0.15)]`}
      >
        <span className="absolute inset-y-0 left-3 w-1 rounded-full bg-white/60" aria-hidden />
        <span className="absolute inset-y-0 right-3 w-1 rounded-full bg-white/60" aria-hidden />
        <span className="min-w-0 flex-1 truncate pl-2 font-cute text-lg">{entry.message.split("\n")[0]}</span>
        <span className="max-w-[35%] shrink-0 truncate pr-2 text-xs text-stone-600">{entry.name}</span>
      </Link>
    </li>
  );
}
