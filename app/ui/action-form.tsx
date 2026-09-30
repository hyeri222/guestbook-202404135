"use client";

import { startTransition, useActionState } from "react";
import type { FormState } from "@/app/actions";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  children: React.ReactNode;
  tone?: "accent" | "danger";
};

/** 서버 액션 폼. 비밀번호가 틀리는 등 거절되면 그 이유를 바로 아래에 보여준다. */
export function ActionForm({ action, submitLabel, children, tone = "accent" }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const color =
    tone === "danger"
      ? "bg-rose-400 shadow-[0_3px_0_#e11d48]"
      : "bg-accent shadow-[0_3px_0_var(--accent-deep)]";

  return (
    <form
      className="flex flex-col gap-3"
      // action 속성으로 넘기면 React가 제출 뒤 폼을 비운다. 비밀번호가 틀렸을 때
      // 고치던 메시지가 사라지지 않도록 직접 제출한다.
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
    >
      {children}
      {state && (
        <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`${color} self-start rounded-full px-6 py-2.5 font-cute text-base text-white transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50`}
      >
        {pending ? "잠시만요…" : submitLabel}
      </button>
    </form>
  );
}
