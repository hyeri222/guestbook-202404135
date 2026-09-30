import Link from "next/link";
import { logOutAction } from "@/app/actions";
import { STATUSES, STATUS_LABELS } from "@/app/ui/labels";
import { Usagi } from "@/app/ui/usagi";
import { requireOwner } from "@/lib/auth";
import { bookStats } from "@/lib/books/repository";

const STATUS_EMOJI = { want_to_read: "🌱", reading: "📖", finished: "🌸" } as const;

export default async function MyPage() {
  await requireOwner();
  const { counts, averageRating } = await bookStats();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-foreground/60">
        ← 책 더미로
      </Link>

      <section className="flex flex-col items-center gap-2 rounded-3xl bg-card p-8 shadow-[0_4px_20px_rgba(63,53,48,0.06)]">
        <span className="flex h-24 w-24 items-end justify-center overflow-hidden rounded-full bg-cream ring-4 ring-accent-soft">
          <Usagi size={88} className="translate-y-3" />
        </span>
        <h1 className="font-cute text-2xl">나의 독서 기록</h1>
        {averageRating !== null && (
          <p className="text-sm text-foreground/60">다 읽은 책 평균 평점 ★ {averageRating.toFixed(1)}</p>
        )}
      </section>

      <ul className="grid grid-cols-3 gap-3">
        {STATUSES.map((status) => (
          <li key={status}>
            <Link
              href={`/?tab=${status}`}
              className="flex flex-col items-center gap-1 rounded-3xl bg-card p-4 shadow-[0_4px_20px_rgba(63,53,48,0.06)] transition hover:-translate-y-0.5"
            >
              <span className="text-2xl" aria-hidden>
                {STATUS_EMOJI[status]}
              </span>
              <span className="font-cute text-2xl">{counts[status]}</span>
              <span className="text-xs text-foreground/60">{STATUS_LABELS[status]}</span>
            </Link>
          </li>
        ))}
      </ul>

      <form action={logOutAction} className="flex justify-center">
        <button
          type="submit"
          className="rounded-full bg-card px-6 py-2.5 font-cute text-base text-foreground/70 shadow-[0_3px_0_rgba(63,53,48,0.12)] transition hover:bg-accent-soft"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
