"use client";

import { useState } from "react";
import type { FormState } from "@/app/actions";
import { type Book, type ReadingStatus, nextStatuses } from "@/lib/books/rules";
import { ActionForm } from "./action-form";
import { DateField, FinishFields, TextField } from "./fields";
import { STATUS_LABELS } from "./labels";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  today: string;
  /** 고칠 책. 없으면 새 책 등록. */
  book?: Book;
};

/** 책 등록과 수정에 함께 쓰는 폼. 다 읽음을 골랐을 때만 평점과 감상평 칸이 나온다. */
export function BookForm({ action, submitLabel, today, book }: Props) {
  const current = book?.status ?? "want_to_read";
  const [status, setStatus] = useState<ReadingStatus>(current);

  return (
    <ActionForm action={action} submitLabel={submitLabel}>
      <TextField label="제목" name="title" defaultValue={book?.title} required />
      <TextField label="저자 (선택)" name="author" defaultValue={book?.author} />

      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="mb-1">독서 상태</legend>
        <div className="flex gap-2">
          {nextStatuses(current).map((value) => (
            <label
              key={value}
              className={`cursor-pointer rounded-full border px-4 py-1.5 ${
                value === status
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/20 text-foreground/70"
              }`}
            >
              <input
                type="radio"
                name="status"
                value={value}
                checked={value === status}
                onChange={() => setStatus(value)}
                className="sr-only"
              />
              {value === "reading" && current === "finished" ? "재독" : STATUS_LABELS[value]}
            </label>
          ))}
        </div>
      </fieldset>

      {/* 상태를 바꿀 때마다 칸을 새로 그려 그 상태의 기본값으로 채운다. */}
      <div key={status} className="flex flex-col gap-3">
        {status === "reading" && (
          <DateField
            label="시작한 날"
            name="startedOn"
            defaultValue={current === "reading" ? book?.startedOn : today}
          />
        )}
        {status === "finished" && (
          <>
            <DateField
              label="시작한 날 (선택)"
              name="startedOn"
              defaultValue={book?.startedOn}
              hint="모르면 비워 두세요."
            />
            {/* 재독 중이면 이전 평점과 감상평이 미리 채워진다(ADR 0001). */}
            <FinishFields
              rating={book?.rating}
              review={book?.review}
              finishedOn={current === "finished" ? (book?.finishedOn ?? today) : today}
            />
          </>
        )}
        {status === "reading" && current === "finished" && (
          <p className="text-xs text-foreground/60">다시 다 읽으면 지금의 평점과 감상평은 새 것으로 바뀝니다.</p>
        )}
      </div>
    </ActionForm>
  );
}
