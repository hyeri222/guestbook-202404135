import Link from "next/link";
import { registerBookAction } from "@/app/actions";
import { BookForm } from "@/app/ui/book-form";
import { requireOwner } from "@/lib/auth";
import { today } from "@/lib/today";

export default async function NewBookPage() {
  await requireOwner();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-foreground/60">
        ← 책 더미로
      </Link>
      <section className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-[0_4px_20px_rgba(74,59,52,0.06)]">
        <h1 className="font-cute text-2xl">새 책 쌓기</h1>
        <BookForm action={registerBookAction} submitLabel="책 등록" today={today()} />
      </section>
    </div>
  );
}
