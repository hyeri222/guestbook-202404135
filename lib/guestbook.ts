// 방명록 규칙: 입력 검사와 글 비밀번호 해시. DB와 Next.js에 의존하지 않는다 (ADR 0001).
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const LIMITS = { name: 20, message: 500, passwordMin: 4 } as const;

export type Result<T> = { ok: true; value: T } | { ok: false; message: string };

export function validateEntry(input: { name: string; message: string; password: string }): Result<{
  name: string;
  message: string;
  password: string;
}> {
  const name = input.name.trim();
  if (!name) return { ok: false, message: "이름을 입력해 주세요." };
  if ([...name].length > LIMITS.name) return { ok: false, message: `이름은 ${LIMITS.name}자까지 쓸 수 있어요.` };
  const message = validateMessage(input.message);
  if (!message.ok) return message;
  if (input.password.length < LIMITS.passwordMin)
    return { ok: false, message: `비밀번호는 ${LIMITS.passwordMin}자 이상이어야 해요.` };
  return { ok: true, value: { name, message: message.value, password: input.password } };
}

export function validateMessage(raw: string): Result<string> {
  const message = raw.replace(/\r\n/g, "\n").trim();
  if (!message) return { ok: false, message: "메시지를 입력해 주세요." };
  if ([...message].length > LIMITS.message)
    return { ok: false, message: `메시지는 ${LIMITS.message}자까지 쓸 수 있어요.` };
  return { ok: true, value: message };
}

/** "scrypt$salt$hash" 형식. 글마다 다른 salt를 쓴다. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, 32).toString("base64url");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}
