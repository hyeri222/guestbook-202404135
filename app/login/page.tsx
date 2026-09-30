import { redirect } from "next/navigation";
import { LoginForm } from "@/app/ui/login-form";
import { isOwner } from "@/lib/auth";

export default async function LoginPage() {
  if (await isOwner()) redirect("/");

  return (
    <section className="mx-auto mt-10 flex w-full max-w-sm flex-col gap-5 rounded-3xl bg-card p-8 shadow-[0_4px_20px_rgba(74,59,52,0.06)]">
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl" aria-hidden>
          📚
        </span>
        <h1 className="font-cute text-2xl">어서 와요!</h1>
        <p className="text-sm text-foreground/60">비밀번호를 넣고 책 더미로 들어가요.</p>
      </div>
      <LoginForm />
    </section>
  );
}
