"use client";

import { logInAction } from "@/app/actions";
import { ActionForm } from "./action-form";
import { inputClass } from "./fields";

export function LoginForm() {
  return (
    <ActionForm action={logInAction} submitLabel="로그인">
      <label className="flex flex-col gap-1 text-sm">
        비밀번호
        <input type="password" name="password" required autoFocus className={inputClass} />
      </label>
    </ActionForm>
  );
}
