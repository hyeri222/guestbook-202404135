import { describe, expect, it } from "vitest";
import { hashPassword, validateEntry, validateMessage, verifyPassword } from "./guestbook";

describe("글 비밀번호", () => {
  it("맞는 비밀번호는 통과하고 틀린 비밀번호는 거절한다", () => {
    const stored = hashPassword("1234");
    expect(verifyPassword("1234", stored)).toBe(true);
    expect(verifyPassword("12345", stored)).toBe(false);
  });

  it("평문을 저장하지 않고, 같은 비밀번호도 글마다 다르게 저장한다", () => {
    const a = hashPassword("1234");
    expect(a).not.toContain("1234");
    expect(a).not.toBe(hashPassword("1234"));
  });
});

describe("방명록 글 검사", () => {
  const ok = { name: " 혜리 ", message: " 안녕! ", password: "1234" };

  it("앞뒤 공백을 지우고 받는다", () => {
    expect(validateEntry(ok)).toEqual({ ok: true, value: { name: "혜리", message: "안녕!", password: "1234" } });
  });

  it.each([
    [{ ...ok, name: " " }, "이름"],
    [{ ...ok, name: "가".repeat(21) }, "이름"],
    [{ ...ok, message: "" }, "메시지"],
    [{ ...ok, password: "123" }, "비밀번호"],
  ])("잘못된 입력은 거절한다 (%j)", (input, word) => {
    const result = validateEntry(input);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.message).toContain(word);
  });

  it("메시지는 500자까지, CRLF 줄바꿈은 한 글자로 센다", () => {
    expect(validateMessage("가".repeat(500)).ok).toBe(true);
    expect(validateMessage("가".repeat(501)).ok).toBe(false);
    expect(validateMessage(`${"가".repeat(249)}\r\n${"나".repeat(250)}`).ok).toBe(true);
  });
});
