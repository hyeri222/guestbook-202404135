"use client";

export function DeleteButton({ action, title }: { action: () => Promise<void>; title: string }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(`"${title}"을(를) 삭제할까요? 되돌릴 수 없습니다.`)) event.preventDefault();
      }}
    >
      <button type="submit" className="rounded border border-red-600 px-4 py-2 text-sm text-red-600">
        책 삭제
      </button>
    </form>
  );
}
