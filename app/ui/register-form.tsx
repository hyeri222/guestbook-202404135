"use client";

import { useState } from "react";
import { registerBookAction } from "@/app/actions";
import type { ReadingStatus } from "@/lib/books/rules";
import { ActionForm } from "./action-form";
import { DateField, FinishFields, TextField, inputClass } from "./fields";
import { STATUSES, STATUS_LABELS } from "./labels";

export function RegisterForm({ today }: { today: string }) {
  const [status, setStatus] = useState<ReadingStatus>("want_to_read");

  return (
    <ActionForm action={registerBookAction} submitLabel="책 등록">
      <TextField label="제목" name="title" required />
      <TextField label="저자 (선택)" name="author" />
      <label className="flex flex-col gap-1 text-sm">
        독서 상태
        <select
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value as ReadingStatus)}
          className={inputClass}
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
      {status === "reading" && <DateField label="시작한 날" name="startedOn" defaultValue={today} />}
      {status === "finished" && (
        <>
          <DateField label="시작한 날 (선택)" name="startedOn" hint="모르면 비워 두세요." />
          <FinishFields finishedOn={today} />
        </>
      )}
    </ActionForm>
  );
}
