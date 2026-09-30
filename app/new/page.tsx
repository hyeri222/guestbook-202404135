import Link from "next/link";
import { createEntryAction } from "@/app/actions";
import { ActionForm } from "@/app/ui/action-form";
import { MessageField, NameField, PasswordField } from "@/app/ui/fields";

export default function NewEntryPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-foreground/60">
        ← 방명록으로
      </Link>
      <section className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-[0_4px_20px_rgba(63,53,48,0.06)]">
        <h1 className="font-cute text-2xl">방명록 쓰기</h1>
        <ActionForm action={createEntryAction} submitLabel="책 쌓기">
          <NameField />
          <MessageField />
          <PasswordField hint="이 글을 고치거나 지울 때 필요해요. 4자 이상." />
        </ActionForm>
      </section>
    </div>
  );
}
