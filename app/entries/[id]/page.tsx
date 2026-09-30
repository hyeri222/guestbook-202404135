import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEntryAction, updateEntryAction } from "@/app/actions";
import { ActionForm } from "@/app/ui/action-form";
import { MessageField, PasswordField } from "@/app/ui/fields";
import { WrittenAt } from "@/app/ui/written-at";
import { findEntry } from "@/lib/entries";

const card = "flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-[0_4px_20px_rgba(63,53,48,0.06)]";

export default async function EntryPage(props: PageProps<"/entries/[id]">) {
  const id = Number((await props.params).id);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const entry = await findEntry(id);
  if (!entry) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-foreground/60">
        ← 방명록으로
      </Link>

      <article className={card}>
        <p className="whitespace-pre-wrap font-cute text-2xl leading-9">{entry.message}</p>
        <p className="text-sm text-foreground/60">
          {entry.name} · <WrittenAt iso={entry.createdAt} />
          {entry.edited && " · 수정됨"}
        </p>
      </article>

      <section className={card}>
        <h2 className="font-cute text-xl">메시지 고치기</h2>
        <ActionForm action={updateEntryAction.bind(null, id)} submitLabel="고치기">
          <MessageField defaultValue={entry.message} />
          <PasswordField />
        </ActionForm>
      </section>

      <section className={card}>
        <h2 className="font-cute text-xl">글 지우기</h2>
        <ActionForm action={deleteEntryAction.bind(null, id)} submitLabel="지우기" tone="danger">
          <PasswordField hint="지운 글은 되돌릴 수 없어요." />
        </ActionForm>
      </section>
    </div>
  );
}
