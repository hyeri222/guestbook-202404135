import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center gap-4 py-12 text-center">
      <h1 className="text-xl font-semibold">책을 찾을 수 없습니다</h1>
      <p className="text-sm text-foreground/60">삭제되었거나 없는 주소입니다.</p>
      <Link href="/" className="underline">
        목록으로
      </Link>
    </section>
  );
}
