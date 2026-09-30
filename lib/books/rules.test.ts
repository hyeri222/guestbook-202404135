import { describe, expect, it } from "vitest";
import { type Book, changeStatus, editDetails, normalizeKey, registerBook } from "./rules";

const TODAY = "2026-09-30";

describe("책 등록", () => {
  it("제목과 저자로 등록하면 읽고 싶음인 책이 된다", () => {
    const result = registerBook({ title: "데미안", author: "헤르만 헤세" }, TODAY);

    expect(result).toEqual({
      ok: true,
      book: {
        title: "데미안",
        author: "헤르만 헤세",
        status: "want_to_read",
        rating: null,
        review: null,
        startedOn: null,
        finishedOn: null,
      },
    });
  });

  it("저자를 비워 두고 등록할 수 있다", () => {
    const result = registerBook({ title: "데미안", author: "  " }, TODAY);

    expect(result.ok && result.book.author).toBeNull();
  });

  it("제목 앞뒤 공백은 지운다", () => {
    const result = registerBook({ title: "  데미안 " }, TODAY);

    expect(result.ok && result.book.title).toBe("데미안");
  });

  it("제목이 없으면 거절한다", () => {
    const result = registerBook({ title: "   " }, TODAY);

    expect(result).toMatchObject({ ok: false, error: "title_required" });
  });
});

describe("중복 판정 키", () => {
  it("띄어쓰기만 다른 제목은 같은 책이다", () => {
    expect(normalizeKey("해리 포터", "J.K. 롤링")).toBe(normalizeKey("해리포터", "J.K.롤링"));
  });

  it("영문 대소문자와 앞뒤 공백만 다른 제목은 같은 책이다", () => {
    expect(normalizeKey(" Harry Potter ", "Rowling")).toBe(normalizeKey("harry potter", "ROWLING"));
  });

  it("저자가 없는 책과 빈 저자는 같은 책이다", () => {
    expect(normalizeKey("데미안", null)).toBe(normalizeKey("데미안", "  "));
  });

  it("저자가 다르면 다른 책이다", () => {
    expect(normalizeKey("데미안", "헤르만 헤세")).not.toBe(normalizeKey("데미안", null));
  });

  it("제목과 저자의 경계가 달라지면 다른 책이다", () => {
    expect(normalizeKey("ab", "c")).not.toBe(normalizeKey("a", "bc"));
  });
});

const wantToRead: Book = {
  title: "데미안",
  author: "헤르만 헤세",
  status: "want_to_read",
  rating: null,
  review: null,
  startedOn: null,
  finishedOn: null,
};

describe("읽기 시작", () => {
  it("읽고 싶음인 책은 읽는 중이 되고 시작한 날이 기록된다", () => {
    const result = changeStatus(wantToRead, { to: "reading", startedOn: "2026-09-01" }, TODAY);

    expect(result).toEqual({
      ok: true,
      book: { ...wantToRead, status: "reading", startedOn: "2026-09-01" },
    });
  });

  it("시작한 날을 비우면 오늘이 된다", () => {
    const result = changeStatus(wantToRead, { to: "reading", startedOn: "" }, TODAY);

    expect(result.ok && result.book.startedOn).toBe(TODAY);
  });

  it("날짜 형식이 아니면 거절한다", () => {
    const result = changeStatus(wantToRead, { to: "reading", startedOn: "2026-13-45" }, TODAY);

    expect(result).toMatchObject({ ok: false, error: "invalid_date" });
  });
});

const reading: Book = { ...wantToRead, status: "reading", startedOn: "2026-09-01" };

describe("다 읽음", () => {
  it("읽는 중인 책에 평점과 감상평을 남기면 다 읽음이 된다", () => {
    const result = changeStatus(
      reading,
      { to: "finished", rating: "4.5", review: " 좋았다 ", finishedOn: "2026-09-20" },
      TODAY,
    );

    expect(result).toEqual({
      ok: true,
      book: {
        ...reading,
        status: "finished",
        rating: 4.5,
        review: "좋았다",
        finishedOn: "2026-09-20",
      },
    });
  });

  it("읽고 싶음인 책은 읽는 중을 건너뛰고 다 읽음이 되며 시작한 날은 비어 있다", () => {
    const result = changeStatus(wantToRead, { to: "finished", rating: "3" }, TODAY);

    expect(result).toMatchObject({
      ok: true,
      book: { status: "finished", rating: 3, startedOn: null, finishedOn: TODAY },
    });
  });

  it("감상평은 비워 둘 수 있다", () => {
    const result = changeStatus(reading, { to: "finished", rating: "5", review: "   " }, TODAY);

    expect(result.ok && result.book.review).toBeNull();
  });

  it("평점이 없으면 거절한다", () => {
    const result = changeStatus(reading, { to: "finished", rating: "" }, TODAY);

    expect(result).toMatchObject({ ok: false, error: "rating_required" });
  });

  it.each(["0", "5.5", "3.3", "-1", "별로"])("평점 %s는 거절한다", (rating) => {
    const result = changeStatus(reading, { to: "finished", rating }, TODAY);

    expect(result).toMatchObject({ ok: false, error: "invalid_rating" });
  });

  it.each(["0.5", "5", "5.0"])("평점 %s는 받는다", (rating) => {
    const result = changeStatus(reading, { to: "finished", rating }, TODAY);

    expect(result.ok).toBe(true);
  });

  it("감상평은 2,000자까지 받는다", () => {
    const result = changeStatus(reading, { to: "finished", rating: "4", review: "가".repeat(2000) }, TODAY);

    expect(result.ok).toBe(true);
  });

  it("2,000자를 넘는 감상평은 거절한다", () => {
    const result = changeStatus(reading, { to: "finished", rating: "4", review: "가".repeat(2001) }, TODAY);

    expect(result).toMatchObject({ ok: false, error: "review_too_long" });
  });

  it("시작한 날보다 이른 다 읽은 날은 거절한다", () => {
    const result = changeStatus(reading, { to: "finished", rating: "4", finishedOn: "2026-08-31" }, TODAY);

    expect(result).toMatchObject({ ok: false, error: "finished_before_started" });
  });

  it("시작한 날과 같은 날 다 읽을 수 있다", () => {
    const result = changeStatus(reading, { to: "finished", rating: "4", finishedOn: "2026-09-01" }, TODAY);

    expect(result.ok).toBe(true);
  });
});

const finished: Book = {
  ...reading,
  status: "finished",
  rating: 3.5,
  review: "처음 읽었을 때",
  finishedOn: "2026-09-20",
};

describe("막힌 전이", () => {
  it.each([
    ["읽는 중", reading],
    ["다 읽음", finished],
  ])("%s인 책은 읽고 싶음으로 되돌릴 수 없다", (_label, book) => {
    const result = changeStatus(book, { to: "want_to_read" }, TODAY);

    expect(result).toMatchObject({ ok: false, error: "transition_not_allowed" });
  });
});

describe("재독", () => {
  it("다 읽은 책을 다시 읽으면 시작한 날만 새로 기록되고 평점, 감상평, 다 읽은 날은 남는다", () => {
    const result = changeStatus(finished, { to: "reading", startedOn: "2026-09-25" }, TODAY);

    expect(result).toEqual({
      ok: true,
      book: { ...finished, status: "reading", startedOn: "2026-09-25" },
    });
  });

  it("재독한 책을 다시 다 읽으면 평점, 감상평, 다 읽은 날을 덮어쓴다", () => {
    const rereading: Book = { ...finished, status: "reading", startedOn: "2026-09-25" };

    const result = changeStatus(rereading, { to: "finished", rating: "5", review: "", finishedOn: "" }, TODAY);

    expect(result).toEqual({
      ok: true,
      book: { ...rereading, status: "finished", rating: 5, review: null, finishedOn: TODAY },
    });
  });

  it("재독한 책의 다 읽은 날은 새 시작한 날보다 이를 수 없다", () => {
    const rereading: Book = { ...finished, status: "reading", startedOn: "2026-09-25" };

    const result = changeStatus(rereading, { to: "finished", rating: "5", finishedOn: "2026-09-20" }, TODAY);

    expect(result).toMatchObject({ ok: false, error: "finished_before_started" });
  });
});

describe("다 읽은 책의 평가 수정", () => {
  it("다 읽은 책에 새 평점과 감상평을 저장하면 덮어쓴다", () => {
    const result = changeStatus(finished, { to: "finished", rating: "4", review: "다시 생각해 보니" }, TODAY);

    expect(result).toMatchObject({
      ok: true,
      book: { status: "finished", rating: 4, review: "다시 생각해 보니" },
    });
  });
});

describe("등록할 때 상태 고르기", () => {
  it("읽는 중으로 등록하면 시작한 날이 기록되고, 비우면 오늘이다", () => {
    const result = registerBook({ title: "데미안", status: "reading", startedOn: "" }, TODAY);

    expect(result).toMatchObject({ ok: true, book: { status: "reading", startedOn: TODAY } });
  });

  it("다 읽음으로 등록하면 평점, 감상평, 다 읽은 날이 함께 기록된다", () => {
    const result = registerBook(
      {
        title: "데미안",
        status: "finished",
        startedOn: "2020-03-01",
        rating: "4.5",
        review: "고등학생 때 읽음",
        finishedOn: "2020-03-15",
      },
      TODAY,
    );

    expect(result).toMatchObject({
      ok: true,
      book: {
        status: "finished",
        startedOn: "2020-03-01",
        rating: 4.5,
        review: "고등학생 때 읽음",
        finishedOn: "2020-03-15",
      },
    });
  });

  it("다 읽음으로 등록할 때 시작한 날을 비우면 시작한 날은 없다", () => {
    const result = registerBook({ title: "데미안", status: "finished", startedOn: "", rating: "4" }, TODAY);

    expect(result).toMatchObject({ ok: true, book: { startedOn: null, finishedOn: TODAY } });
  });

  it("다 읽음으로 등록할 때도 평점은 필수다", () => {
    const result = registerBook({ title: "데미안", status: "finished", rating: "" }, TODAY);

    expect(result).toMatchObject({ ok: false, error: "rating_required" });
  });

  it("다 읽음으로 등록할 때 다 읽은 날이 시작한 날보다 이르면 거절한다", () => {
    const result = registerBook(
      { title: "데미안", status: "finished", startedOn: "2020-03-15", rating: "4", finishedOn: "2020-03-01" },
      TODAY,
    );

    expect(result).toMatchObject({ ok: false, error: "finished_before_started" });
  });
});

describe("제목과 저자 수정", () => {
  it("제목과 저자를 고쳐도 독서 상태와 평가는 그대로다", () => {
    const result = editDetails(finished, { title: " 데미안 (개정판) ", author: "" });

    expect(result).toEqual({
      ok: true,
      book: { ...finished, title: "데미안 (개정판)", author: null },
    });
  });

  it("제목을 지우면 거절한다", () => {
    const result = editDetails(finished, { title: "" });

    expect(result).toMatchObject({ ok: false, error: "title_required" });
  });
});

describe("시작한 날 고치기", () => {
  it("읽는 중인 책의 시작한 날을 고칠 수 있다", () => {
    const result = changeStatus(reading, { to: "reading", startedOn: "2026-08-15" }, TODAY);

    expect(result).toEqual({ ok: true, book: { ...reading, startedOn: "2026-08-15" } });
  });

  it("다 읽은 책의 평가를 고칠 때 시작한 날도 고칠 수 있다", () => {
    const result = changeStatus(finished, { to: "finished", rating: "3.5", startedOn: "2026-08-15" }, TODAY);

    expect(result).toMatchObject({ ok: true, book: { startedOn: "2026-08-15" } });
  });

  it("다 읽은 책의 시작한 날을 비우면 시작한 날은 없다", () => {
    const result = changeStatus(finished, { to: "finished", rating: "3.5", startedOn: "" }, TODAY);

    expect(result).toMatchObject({ ok: true, book: { startedOn: null } });
  });

  it("시작한 날을 보내지 않으면 그대로 둔다", () => {
    const result = changeStatus(finished, { to: "finished", rating: "3.5" }, TODAY);

    expect(result).toMatchObject({ ok: true, book: { startedOn: finished.startedOn } });
  });

  it("고친 시작한 날이 다 읽은 날보다 늦으면 거절한다", () => {
    const result = changeStatus(
      finished,
      { to: "finished", rating: "3.5", startedOn: "2026-09-25", finishedOn: "2026-09-20" },
      TODAY,
    );

    expect(result).toMatchObject({ ok: false, error: "finished_before_started" });
  });
});
