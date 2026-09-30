import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { listBooks } from "@/lib/books/repository";
import { BookPile } from "./ui/book-pile";
import { BookSpine } from "./ui/book-spine";
import { STATUSES, STATUS_LABELS, isStatus } from "./ui/labels";

export default async function Home(props: PageProps<"/">) {
  await requireOwner();

  const { tab } = await props.searchParams;
  const status = isStatus(tab) ? tab : "want_to_read";
  const books = await listBooks(status);

  return (
    <div className="flex flex-col gap-4">
      <nav className="flex justify-center gap-2">
        {STATUSES.map((value) => (
          <Link
            key={value}
            href={`/?tab=${value}`}
            aria-current={value === status ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 font-cute text-base transition ${
              value === status
                ? "bg-accent text-white shadow-[0_3px_0_#e56f86]"
                : "bg-card text-foreground/60 hover:bg-accent-soft"
            }`}
          >
            {STATUS_LABELS[value]}
          </Link>
        ))}
      </nav>

      <BookPile>
        {books.length === 0 ? (
          <div className="flex flex-col items-center gap-2 pb-4 text-center">
            <span className="text-5xl" aria-hidden>
              🌱
            </span>
            <p className="font-cute text-lg text-foreground/70">{STATUS_LABELS[status]} 책이 아직 없어요</p>
            <p className="text-sm text-foreground/50">오른쪽 아래 + 버튼으로 책을 쌓아 보세요.</p>
          </div>
        ) : (
          <>
            <p className="mb-3 font-cute text-foreground/50">{books.length}권 쌓였어요</p>
            {/* 최근 책이 맨 위에 오는 책 더미 */}
            <ul className="flex w-full max-w-md flex-col gap-1">
              {books.map((book) => (
                <BookSpine key={book.id} book={book} />
              ))}
            </ul>
          </>
        )}
      </BookPile>

      <Link
        href="/books/new"
        aria-label="책 등록"
        className="fixed bottom-6 right-6 z-10 flex h-16 w-16 items-center justify-center rounded-full bg-accent font-cute text-4xl leading-none text-white shadow-[0_4px_0_#e56f86,0_8px_24px_rgba(255,138,159,0.45)] transition hover:-translate-y-0.5 hover:rotate-90 active:translate-y-0.5"
      >
        +
      </Link>
    </div>
  );
}
