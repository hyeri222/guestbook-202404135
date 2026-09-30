import { redirect } from "next/navigation";
import { LoginForm } from "@/app/ui/login-form";
import { isOwner } from "@/lib/auth";

export default async function LoginPage() {
  if (await isOwner()) redirect("/");

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-xl font-semibold">로그인</h1>
      <LoginForm />
    </section>
  );
}
