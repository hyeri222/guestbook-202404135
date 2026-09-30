"use client";

export function DeleteButton({ action, title }: { action: () => Promise<void>; title: string }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(`"${title}"을(를) 삭제할까요? 되돌릴 수 없습니다.`)) event.preventDefault();
      }}
    >
      <button type="submit" className="rounded-full px-4 py-2 text-sm text-foreground/50 underline-offset-4 hover:text-red-500 hover:underline">
        책 삭제
      </button>
    </form>
  );
}
