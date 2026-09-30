import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center gap-4 py-12 text-center">
      <h1 className="font-cute text-2xl">글을 찾을 수 없어요</h1>
      <p className="text-sm text-foreground/60">삭제되었거나 없는 주소예요.</p>
      <Link href="/" className="underline">
        방명록으로
      </Link>
    </section>
  );
}
