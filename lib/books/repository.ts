// 책 저장소: books 테이블을 읽고 쓰는 얇은 층. 규칙 판단은 하지 않는다.
import { neon } from "@neondatabase/serverless";
import { type Book, type ReadingStatus, normalizeKey } from "./rules";

export type StoredBook = Book & { id: number };

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL 환경변수가 없습니다.");
  return neon(url);
}

// 날짜는 시간대 변환을 피하려고 문자열로 꺼낸다.
type Row = {
  id: string;
  title: string;
  author: string | null;
  status: ReadingStatus;
  rating: string | null;
  review: string | null;
  started_on: string | null;
  finished_on: string | null;
};

function toBook(row: Row): StoredBook {
  return {
    id: Number(row.id),
    title: row.title,
    author: row.author,
    status: row.status,
    rating: row.rating === null ? null : Number(row.rating),
    review: row.review,
    startedOn: row.started_on,
    finishedOn: row.finished_on,
  };
}

export async function listBooks(status: ReadingStatus): Promise<StoredBook[]> {
  const sql = db();
  const rows = await sql`
    select id, title, author, status, rating, review,
           started_on::text as started_on, finished_on::text as finished_on
    from books
    where status = ${status}
    order by
      case when ${status} = 'reading' then started_on end desc nulls last,
      case when ${status} = 'finished' then finished_on end desc nulls last,
      created_at desc
  `;
  return (rows as Row[]).map(toBook);
}

export async function findBook(id: number): Promise<StoredBook | null> {
  const sql = db();
  const rows = await sql`
    select id, title, author, status, rating, review,
           started_on::text as started_on, finished_on::text as finished_on
    from books
    where id = ${id}
  `;
  return rows.length ? toBook(rows[0] as Row) : null;
}

/** 같은 제목 + 저자의 책 id. 없으면 null. */
export async function findDuplicateId(book: Pick<Book, "title" | "author">): Promise<number | null> {
  const sql = db();
  const rows = await sql`
    select id from books where normalized_key = ${normalizeKey(book.title, book.author)}
  `;
  return rows.length ? Number(rows[0].id) : null;
}

export async function insertBook(book: Book): Promise<number> {
  const sql = db();
  const rows = await sql`
    insert into books (title, author, normalized_key, status, rating, review, started_on, finished_on)
    values (${book.title}, ${book.author}, ${normalizeKey(book.title, book.author)}, ${book.status},
            ${book.rating}, ${book.review}, ${book.startedOn}, ${book.finishedOn})
    returning id
  `;
  return Number(rows[0].id);
}

export async function updateBook(id: number, book: Book): Promise<void> {
  const sql = db();
  await sql`
    update books set
      title = ${book.title},
      author = ${book.author},
      normalized_key = ${normalizeKey(book.title, book.author)},
      status = ${book.status},
      rating = ${book.rating},
      review = ${book.review},
      started_on = ${book.startedOn},
      finished_on = ${book.finishedOn},
      updated_at = now()
    where id = ${id}
  `;
}

export async function deleteBook(id: number): Promise<void> {
  const sql = db();
  await sql`delete from books where id = ${id}`;
}

/** 동시에 같은 책을 등록하는 경합에서 unique 제약이 막았는지 확인한다. */
export function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}
