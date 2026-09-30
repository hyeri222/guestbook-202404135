// 방명록 글 저장소. 비밀번호 해시는 목록에 절대 싣지 않는다.
import { neon } from "@neondatabase/serverless";

export type Entry = { id: number; name: string; message: string; createdAt: string; edited: boolean };

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL 환경변수가 없습니다.");
  return neon(url);
}

type Row = { id: string; name: string; message: string; created_at: Date | string; edited: boolean };

const toEntry = (r: Row): Entry => ({
  id: Number(r.id),
  name: r.name,
  message: r.message,
  createdAt: new Date(r.created_at).toISOString(),
  edited: r.edited,
});

export async function listEntries(): Promise<Entry[]> {
  const rows = await db()`
    select id, name, message, created_at, updated_at > created_at as edited
    from entries order by created_at desc, id desc`;
  return (rows as Row[]).map(toEntry);
}

export async function findEntry(id: number): Promise<Entry | null> {
  const rows = await db()`
    select id, name, message, created_at, updated_at > created_at as edited from entries where id = ${id}`;
  return rows.length ? toEntry(rows[0] as Row) : null;
}

export async function findPasswordHash(id: number): Promise<string | null> {
  const rows = await db()`select password_hash from entries where id = ${id}`;
  return rows.length ? String(rows[0].password_hash) : null;
}

export async function insertEntry(e: { name: string; message: string; passwordHash: string }) {
  await db()`insert into entries (name, message, password_hash) values (${e.name}, ${e.message}, ${e.passwordHash})`;
}

export async function updateMessage(id: number, message: string) {
  await db()`update entries set message = ${message}, updated_at = now() where id = ${id}`;
}

export async function deleteEntry(id: number) {
  await db()`delete from entries where id = ${id}`;
}
