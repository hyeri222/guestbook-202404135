import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteBookAction, saveBookAction } from "@/app/actions";
import { BookForm } from "@/app/ui/book-form";
import { DeleteButton } from "@/app/ui/delete-button";
import { STATUS_LABELS, formatRating } from "@/app/ui/labels";
import { requireOwner } from "@/lib/auth";
import { findBook } from "@/lib/books/repository";
import { today } from "@/lib/today";

export default async function BookPage(props: PageProps<"/books/[id]">) {
  await requireOwner();

  const { id: rawId } = await props.params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();

  const book = await findBook(id);
  if (!book) notFound();

  const finished = book.status === "finished";

  return (
    <div className="flex flex-col gap-8">
      <Link href={`/?tab=${book.status}`} className="text-sm text-foreground/60">
        ← 책 더미로
      </Link>
      <section className="flex flex-col gap-2">
        <p className="text-sm text-foreground/60">{STATUS_LABELS[book.status]}</p>
        <h1 className="font-cute text-3xl">{book.title}</h1>
        {book.author && <p className="text-foreground/80">{book.author}</p>}
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {book.startedOn && (
            <>
              <dt className="text-foreground/60">시작한 날</dt>
              <dd>{book.startedOn}</dd>
            </>
          )}
          {/* 재독 중에는 이전 평점과 다 읽은 날을 보여주지 않는다. */}
          {finished && (
            <>
              <dt className="text-foreground/60">다 읽은 날</dt>
              <dd>{book.finishedOn}</dd>
              <dt className="text-foreground/60">평점</dt>
              <dd>{book.rating !== null && formatRating(book.rating)}</dd>
            </>
          )}
        </dl>
        {finished && book.review && <p className="mt-4 whitespace-pre-wrap leading-7">{book.review}</p>}
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-[0_4px_20px_rgba(63,53,48,0.06)]">
        <h2 className="font-cute text-xl">기록 고치기</h2>
        <BookForm action={saveBookAction.bind(null, id)} submitLabel="저장" today={today()} book={book} />
      </section>

      <DeleteButton action={deleteBookAction.bind(null, id)} title={book.title} />
    </div>
  );
}
