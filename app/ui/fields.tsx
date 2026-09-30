import { LIMITS } from "@/lib/guestbook";

export const inputClass =
  "rounded-2xl border border-foreground/10 bg-card px-4 py-2.5 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent-soft";

export function NameField() {
  return (
    <label className="flex flex-col gap-1 text-sm">
      이름
      <input name="name" required maxLength={LIMITS.name} className={inputClass} />
    </label>
  );
}

export function MessageField({ defaultValue }: { defaultValue?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      메시지
      <textarea
        name="message"
        required
        rows={4}
        maxLength={LIMITS.message}
        defaultValue={defaultValue}
        className={inputClass}
      />
    </label>
  );
}

export function PasswordField({ hint }: { hint?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      글 비밀번호
      <input
        type="password"
        name="password"
        required
        minLength={LIMITS.passwordMin}
        autoComplete="off"
        className={inputClass}
      />
      {hint && <span className="text-xs text-foreground/50">{hint}</span>}
    </label>
  );
}
