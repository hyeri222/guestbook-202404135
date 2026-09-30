import Link from "next/link";
import { connection } from "next/server";
import { listEntries } from "@/lib/entries";
import { BookPile } from "./ui/book-pile";
import { BookSpine } from "./ui/book-spine";

export default async function Home() {
  await connection(); // 요청마다 최신 방명록을 읽는다.
  const entries = await listEntries();

  return (
    <div className="flex flex-col gap-4">
      <BookPile>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 pb-4 text-center">
            <span className="text-5xl" aria-hidden>
              📖
            </span>
            <p className="font-cute text-lg text-foreground/70">아직 방명록이 비어 있어요</p>
            <p className="text-sm text-foreground/50">오른쪽 아래 + 버튼으로 첫 글을 남겨 보세요.</p>
          </div>
        ) : (
          <>
            <p className="mb-3 font-cute text-foreground/50">방명록 {entries.length}권 쌓였어요</p>
            {/* 최신 글이 맨 위에 오는 책 더미 */}
            <ul className="flex w-full max-w-md flex-col gap-1">
              {entries.map((entry) => (
                <BookSpine key={entry.id} entry={entry} />
              ))}
            </ul>
          </>
        )}
      </BookPile>

      <Link
        href="/new"
        aria-label="방명록 쓰기"
        className="fixed bottom-6 right-6 z-10 flex h-16 w-16 items-center justify-center rounded-full bg-accent font-cute text-4xl leading-none text-white shadow-[0_4px_0_var(--accent-deep),0_8px_24px_rgba(246,160,180,0.45)] transition hover:-translate-y-1 active:translate-y-0.5"
      >
        +
      </Link>
    </div>
  );
}
