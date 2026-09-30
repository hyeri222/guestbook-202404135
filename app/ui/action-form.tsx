"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/actions";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  children: React.ReactNode;
  className?: string;
};

/** 서버 액션 폼. 거절 사유와 "이미 있는 책" 링크를 보여준다. */
export function ActionForm({ action, submitLabel, children, className }: Props) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className={className ?? "flex flex-col gap-3"}>
      {children}
      {state && (
        <p aria-live="polite" className="text-sm text-red-600">
          {state.message}
          {state.duplicateOf !== undefined && (
            <>
              {" "}
              <Link href={`/books/${state.duplicateOf}`} className="underline">
                기존 책 보기
              </Link>
            </>
          )}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
      >
        {pending ? "저장 중…" : submitLabel}
      </button>
    </form>
  );
}
