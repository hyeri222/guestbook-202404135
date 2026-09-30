import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { listBooks } from "@/lib/books/repository";
import { today } from "@/lib/today";
import { registerBookAction } from "./actions";
import { BookForm } from "./ui/book-form";
import { STATUSES, STATUS_LABELS, formatRating, isStatus } from "./ui/labels";

export default async function Home(props: PageProps<"/">) {
  await requireOwner();

  const { tab } = await props.searchParams;
  const status = isStatus(tab) ? tab : "want_to_read";
  const books = await listBooks(status);

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex gap-2 border-b border-foreground/10">
        {STATUSES.map((value) => (
          <Link
            key={value}
            href={`/?tab=${value}`}
            aria-current={value === status ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              value === status ? "border-foreground font-semibold" : "border-transparent text-foreground/60"
            }`}
          >
            {STATUS_LABELS[value]}
          </Link>
        ))}
      </nav>

      {books.length === 0 ? (
        <p className="py-8 text-center text-sm text-foreground/60">
          {STATUS_LABELS[status]} 책이 아직 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-foreground/10">
          {books.map((book) => (
            <li key={book.id}>
              <Link href={`/books/${book.id}`} className="flex items-baseline justify-between gap-4 py-3">
                <span>
                  <span className="font-medium">{book.title}</span>
                  {book.author && <span className="ml-2 text-sm text-foreground/60">{book.author}</span>}
                </span>
                {book.status === "finished" && book.rating !== null && (
                  <span className="shrink-0 text-sm">{formatRating(book.rating)}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="flex flex-col gap-3 rounded border border-foreground/10 p-4">
        <h2 className="font-semibold">새 책 등록</h2>
        <BookForm action={registerBookAction} submitLabel="책 등록" today={today()} />
      </section>
    </div>
  );
}
