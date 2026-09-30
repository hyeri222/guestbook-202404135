// 책 규칙: 독서 기록장의 모든 도메인 규칙. DB, 쿠키, Next.js에 의존하지 않는다.
// 용어는 GLOSSARY.md, 재독 덮어쓰기는 docs/adr/0001 참고.

export type ReadingStatus = "want_to_read" | "reading" | "finished";

/** 날짜는 모두 "YYYY-MM-DD" 문자열이다. */
export type Book = {
  title: string;
  author: string | null;
  status: ReadingStatus;
  rating: number | null;
  review: string | null;
  startedOn: string | null;
  finishedOn: string | null;
};

export type RuleError =
  | "title_required"
  | "invalid_date"
  | "rating_required"
  | "invalid_rating"
  | "review_too_long"
  | "finished_before_started"
  | "transition_not_allowed";

export const REVIEW_MAX_LENGTH = 2000;

export type RuleResult =
  | { ok: true; book: Book }
  | { ok: false; error: RuleError; message: string };

const MESSAGES: Record<RuleError, string> = {
  title_required: "제목을 입력해 주세요.",
  invalid_date: "날짜 형식이 올바르지 않습니다.",
  rating_required: "다 읽은 책에는 평점을 매겨 주세요.",
  invalid_rating: "평점은 0.5점부터 5.0점까지, 0.5점 단위입니다.",
  review_too_long: `감상평은 ${REVIEW_MAX_LENGTH.toLocaleString()}자까지 쓸 수 있습니다.`,
  finished_before_started: "다 읽은 날은 시작한 날보다 이를 수 없습니다.",
  transition_not_allowed: "읽기 시작한 책은 읽고 싶음으로 되돌릴 수 없습니다.",
};

export type DetailsInput = {
  title: string;
  author?: string | null;
};

/** 등록할 때는 세 상태 중 아무거나 고를 수 있다. 고르지 않으면 읽고 싶음. */
export type RegisterInput = DetailsInput & {
  status?: ReadingStatus;
  startedOn?: string | null;
  rating?: string;
  review?: string | null;
  finishedOn?: string | null;
};

export function registerBook(input: RegisterInput, today: string): RuleResult {
  const details = parseDetails(input);
  if (!details.ok) return details;

  const book: Book = {
    ...details.book,
    status: "want_to_read",
    rating: null,
    review: null,
    startedOn: null,
    finishedOn: null,
  };

  switch (input.status ?? "want_to_read") {
    case "want_to_read":
      return { ok: true, book };
    case "reading":
      return changeStatus(book, { to: "reading", startedOn: input.startedOn }, today);
    case "finished": {
      // 읽는 중을 건너뛰고 다 읽은 책은 시작한 날을 모를 수 있으니 오늘로 채우지 않는다.
      const startedOn = blankToNull(input.startedOn);
      if (startedOn && !isValidDate(startedOn)) return reject("invalid_date");
      return changeStatus(
        { ...book, startedOn },
        { to: "finished", rating: input.rating ?? "", review: input.review, finishedOn: input.finishedOn },
        today,
      );
    }
  }
}

/** 제목과 저자만 고친다. 독서 상태와 평가는 그대로다. */
export function editDetails(book: Book, input: DetailsInput): RuleResult {
  const details = parseDetails(input);
  if (!details.ok) return details;

  return { ok: true, book: { ...book, ...details.book } };
}

function parseDetails(
  input: DetailsInput,
): { ok: true; book: Pick<Book, "title" | "author"> } | Extract<RuleResult, { ok: false }> {
  const title = input.title.trim();
  if (!title) return reject("title_required");

  return { ok: true, book: { title, author: blankToNull(input.author) } };
}

/** 폼에서 온 값 그대로 받는다. 평점도 문자열이다. */
export type StatusChange =
  | { to: "want_to_read" }
  | { to: "reading"; startedOn?: string | null }
  | {
      to: "finished";
      rating: string;
      review?: string | null;
      finishedOn?: string | null;
      /** 보내지 않으면 그대로 두고, 비우면 지운다. 다 읽은 책의 시작한 날을 고칠 때 쓴다. */
      startedOn?: string | null;
    };

/**
 * 허용하는 전이는 읽고 싶음 → 읽는 중, 읽고 싶음 → 다 읽음, 읽는 중 → 다 읽음,
 * 다 읽음 → 읽는 중(재독)뿐이다. 읽고 싶음으로는 어디서도 돌아갈 수 없다.
 * 같은 상태로의 변경은 수정으로 받는다(시작한 날, 평점과 감상평 고치기).
 * 재독해도 평점, 감상평, 다 읽은 날은 다시 다 읽을 때까지 남는다(ADR 0001).
 */
export function changeStatus(book: Book, change: StatusChange, today: string): RuleResult {
  if (change.to === "want_to_read") return reject("transition_not_allowed");

  if (change.to === "reading") {
    const startedOn = dateOrToday(change.startedOn, today);
    if (!startedOn) return reject("invalid_date");

    return { ok: true, book: { ...book, status: "reading", startedOn } };
  }

  if (!change.rating.trim()) return reject("rating_required");
  const rating = parseRating(change.rating);
  if (rating === null) return reject("invalid_rating");

  const review = blankToNull(change.review);
  if (review && [...review].length > REVIEW_MAX_LENGTH) return reject("review_too_long");

  const finishedOn = dateOrToday(change.finishedOn, today);
  if (!finishedOn) return reject("invalid_date");
  const startedOn = change.startedOn === undefined ? book.startedOn : blankToNull(change.startedOn);
  if (startedOn && !isValidDate(startedOn)) return reject("invalid_date");
  if (startedOn && finishedOn < startedOn) return reject("finished_before_started");

  return { ok: true, book: { ...book, status: "finished", rating, review, startedOn, finishedOn } };
}

/** 같은 책인지 판정하는 키. 공백과 영문 대소문자 차이는 무시한다. */
export function normalizeKey(title: string, author: string | null | undefined): string {
  const squash = (value: string) => value.normalize("NFC").replace(/\s+/g, "").toLowerCase();
  // 제목과 저자 어디에도 들어갈 수 없는 구분자를 써서 "ab|c"와 "a|bc"를 구분한다.
  return `${squash(title)}\u001f${squash(author ?? "")}`;
}

function reject(error: RuleError): RuleResult {
  return { ok: false, error, message: MESSAGES[error] };
}

function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** 0.5~5.0, 0.5 단위가 아니면 null. */
function parseRating(value: string): number | null {
  const rating = Number(value.trim());
  if (!Number.isFinite(rating) || rating < 0.5 || rating > 5) return null;
  return Number.isInteger(rating * 2) ? rating : null;
}

/** 빈 값은 오늘로 채우고, 올바르지 않은 날짜는 null을 돌려준다. */
function dateOrToday(value: string | null | undefined, today: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return today;
  return isValidDate(trimmed) ? trimmed : null;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}
