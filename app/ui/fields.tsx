import { REVIEW_MAX_LENGTH } from "@/lib/books/rules";

export const inputClass = "rounded border border-foreground/20 bg-transparent px-3 py-2";

const RATINGS = Array.from({ length: 10 }, (_, i) => ((i + 1) / 2).toFixed(1));

export function TextField(props: { label: string; name: string; defaultValue?: string | null; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {props.label}
      <input
        name={props.name}
        defaultValue={props.defaultValue ?? ""}
        required={props.required}
        className={inputClass}
      />
    </label>
  );
}

export function DateField(props: { label: string; name: string; defaultValue?: string | null; hint?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {props.label}
      <input type="date" name={props.name} defaultValue={props.defaultValue ?? ""} className={inputClass} />
      {props.hint && <span className="text-xs text-foreground/60">{props.hint}</span>}
    </label>
  );
}

/** 다 읽음으로 바꿀 때 입력하는 평점, 감상평, 다 읽은 날. */
export function FinishFields(props: { rating?: number | null; review?: string | null; finishedOn: string }) {
  return (
    <>
      <label className="flex flex-col gap-1 text-sm">
        평점
        <select
          name="rating"
          required
          defaultValue={props.rating ? props.rating.toFixed(1) : ""}
          className={inputClass}
        >
          <option value="" disabled>
            평점을 고르세요
          </option>
          {RATINGS.map((rating) => (
            <option key={rating} value={rating}>
              ★ {rating}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        감상평 (선택)
        <textarea
          name="review"
          rows={5}
          maxLength={REVIEW_MAX_LENGTH}
          defaultValue={props.review ?? ""}
          className={inputClass}
        />
      </label>
      <DateField label="다 읽은 날" name="finishedOn" defaultValue={props.finishedOn} />
    </>
  );
}
