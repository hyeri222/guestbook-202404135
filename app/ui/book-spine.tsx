import Link from "next/link";
import type { StoredBook } from "@/lib/books/repository";
import { formatRating } from "./labels";

// 책등 색은 파스텔 몇 가지를 돌려 쓴다. 글자는 어두운 색이라 다크 모드에서도 읽힌다.
const COLORS = [
  "bg-rose-200",
  "bg-amber-200",
  "bg-lime-200",
  "bg-sky-200",
  "bg-violet-200",
  "bg-orange-200",
  "bg-teal-200",
  "bg-pink-200",
];
const WIDTHS = ["w-[92%]", "w-[84%]", "w-[96%]", "w-[78%]", "w-[88%]"];
const TILTS = ["-rotate-1", "rotate-0", "rotate-1", "rotate-[0.5deg]", "-rotate-[0.5deg]"];
// 제목과 저자 두 줄이 들어가는 높이
const HEIGHTS = ["h-14", "h-16", "h-[52px]", "h-[60px]"];

/** 같은 책은 늘 같은 모양이 되도록 id로 고른다. */
function pick<T>(items: T[], id: number, salt: number): T {
  return items[(id * 7 + salt * 13) % items.length];
}

/** 더미에 쌓인 책 한 권의 책등. */
export function BookSpine({ book }: { book: StoredBook }) {
  const shape = [
    pick(COLORS, book.id, 0),
    pick(WIDTHS, book.id, 1),
    pick(TILTS, book.id, 2),
    pick(HEIGHTS, book.id, 3),
  ].join(" ");

  return (
    <li className="flex justify-center">
      <Link
        href={`/books/${book.id}`}
        className={`${shape} group relative flex items-center gap-3 rounded-md px-5 text-stone-800 shadow-[0_2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_0_rgba(0,0,0,0.15)]`}
      >
        {/* 책등 양 끝의 띠 */}
        <span className="absolute inset-y-0 left-3 w-1 rounded-full bg-white/60" aria-hidden />
        <span className="absolute inset-y-0 right-3 w-1 rounded-full bg-white/60" aria-hidden />
        <span className="flex min-w-0 flex-1 flex-col pl-2 leading-tight">
          <span className="truncate font-cute text-lg">{book.title}</span>
          {book.author && <span className="truncate text-xs text-stone-600">{book.author}</span>}
        </span>
        {book.status === "finished" && book.rating !== null && (
          <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 pr-2 text-xs">{formatRating(book.rating)}</span>
        )}
      </Link>
    </li>
  );
}
