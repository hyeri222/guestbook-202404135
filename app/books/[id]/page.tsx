import { notFound } from "next/navigation";
import { changeStatusAction, deleteBookAction, editBookAction } from "@/app/actions";
import { ActionForm } from "@/app/ui/action-form";
import { DeleteButton } from "@/app/ui/delete-button";
import { DateField, FinishFields, TextField } from "@/app/ui/fields";
import { STATUS_LABELS, formatRating } from "@/app/ui/labels";
import { isOwner } from "@/lib/auth";
import { findBook } from "@/lib/books/repository";
import { today } from "@/lib/today";

export default async function BookPage(props: PageProps<"/books/[id]">) {
  const { id: rawId } = await props.params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();

  const [book, owner] = await Promise.all([findBook(id), isOwner()]);
  if (!book) notFound();

  const changeStatus = changeStatusAction.bind(null, id);
  const finished = book.status === "finished";

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <p className="text-sm text-foreground/60">{STATUS_LABELS[book.status]}</p>
        <h1 className="text-2xl font-semibold">{book.title}</h1>
        {book.author && <p className="text-foreground/80">{book.author}</p>}
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {book.startedOn && (
            <>
              <dt className="text-foreground/60">시작한 날</dt>
              <dd>{book.startedOn}</dd>
            </>
          )}
          {/* 재독 중인 책의 이전 평점과 다 읽은 날은 보여주지 않는다(ADR 0001). */}
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

      {owner && (
        <>
          {book.status === "want_to_read" && (
            <OwnerSection title="읽기 시작">
              <ActionForm action={changeStatus} submitLabel="읽는 중으로">
                <input type="hidden" name="to" value="reading" />
                <DateField label="시작한 날" name="startedOn" defaultValue={today()} />
              </ActionForm>
            </OwnerSection>
          )}

          {book.status === "reading" && (
            <OwnerSection title="시작한 날 고치기">
              <ActionForm action={changeStatus} submitLabel="저장">
                <input type="hidden" name="to" value="reading" />
                <DateField label="시작한 날" name="startedOn" defaultValue={book.startedOn ?? today()} />
              </ActionForm>
            </OwnerSection>
          )}

          {!finished && (
            <OwnerSection title="다 읽음">
              {/* 재독 중이면 이전 평점과 감상평이 미리 채워진다. */}
              <ActionForm action={changeStatus} submitLabel="다 읽음으로">
                <input type="hidden" name="to" value="finished" />
                <FinishFields rating={book.rating} review={book.review} finishedOn={today()} />
              </ActionForm>
            </OwnerSection>
          )}

          {finished && (
            <>
              <OwnerSection title="평점과 감상평 고치기">
                <ActionForm action={changeStatus} submitLabel="저장">
                  <input type="hidden" name="to" value="finished" />
                  <DateField
                    label="시작한 날 (선택)"
                    name="startedOn"
                    defaultValue={book.startedOn}
                    hint="모르면 비워 두세요."
                  />
                  <FinishFields rating={book.rating} review={book.review} finishedOn={book.finishedOn ?? today()} />
                </ActionForm>
              </OwnerSection>
              <OwnerSection title="재독">
                <p className="text-sm text-foreground/60">
                  다시 다 읽으면 지금의 평점과 감상평은 새 것으로 바뀝니다.
                </p>
                <ActionForm action={changeStatus} submitLabel="읽는 중으로">
                  <input type="hidden" name="to" value="reading" />
                  <DateField label="시작한 날" name="startedOn" defaultValue={today()} />
                </ActionForm>
              </OwnerSection>
            </>
          )}

          <OwnerSection title="제목과 저자 고치기">
            <ActionForm action={editBookAction.bind(null, id)} submitLabel="저장">
              <TextField label="제목" name="title" defaultValue={book.title} required />
              <TextField label="저자 (선택)" name="author" defaultValue={book.author} />
            </ActionForm>
          </OwnerSection>

          <DeleteButton action={deleteBookAction.bind(null, id)} title={book.title} />
        </>
      )}
    </div>
  );
}

function OwnerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded border border-foreground/10 p-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}
