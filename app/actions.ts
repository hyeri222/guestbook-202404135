"use server";

// 서버 액션: 주인 확인 → 현재 책 조회 → 책 규칙 → 저장. 규칙 판단은 lib/books/rules.ts에만 있다.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isOwner, logIn, logOut } from "@/lib/auth";
import {
  deleteBook,
  findBook,
  findDuplicateId,
  insertBook,
  isDuplicateKeyError,
  updateBook,
} from "@/lib/books/repository";
import { type Book, type ReadingStatus, type RegisterInput, registerBook, reviseBook } from "@/lib/books/rules";
import { today } from "@/lib/today";

export type FormState = { message: string; duplicateOf?: number } | null;

const NOT_OWNER: FormState = { message: "로그인이 풀렸습니다. 다시 로그인해 주세요." };
const NOT_FOUND: FormState = { message: "책을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다." };

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** 책 폼의 값. 고른 독서 상태에 없는 칸은 폼에 없으므로 undefined로 둔다. */
function bookInput(formData: FormData): RegisterInput {
  const optional = (name: string) => (formData.has(name) ? field(formData, name) : undefined);
  const status = field(formData, "status");

  return {
    title: field(formData, "title"),
    author: field(formData, "author"),
    status: (["want_to_read", "reading", "finished"] as const).find((s) => s === status),
    startedOn: optional("startedOn"),
    rating: optional("rating"),
    review: optional("review"),
    finishedOn: optional("finishedOn"),
  };
}

function revalidateBookPages(id?: number) {
  revalidatePath("/");
  if (id !== undefined) revalidatePath(`/books/${id}`);
}

/** 저장하고, 같은 책이 이미 있으면 그 책을 알려준다. 저장했으면 null. */
async function saveUnlessDuplicate(book: Book, save: () => Promise<unknown>, selfId?: number): Promise<FormState> {
  const duplicate = async (): Promise<FormState> => {
    const id = await findDuplicateId(book);
    if (id === null || id === selfId) return null;
    return { message: "이미 있는 책입니다.", duplicateOf: id };
  };

  const found = await duplicate();
  if (found) return found;

  try {
    await save();
    return null;
  } catch (error) {
    // 동시에 같은 책을 저장하는 경합은 unique 제약이 막는다.
    if (!isDuplicateKeyError(error)) throw error;
    return (await duplicate()) ?? { message: "이미 있는 책입니다." };
  }
}

export async function registerBookAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isOwner())) return NOT_OWNER;

  const result = registerBook(bookInput(formData), today());
  if (!result.ok) return { message: result.message };

  const failed = await saveUnlessDuplicate(result.book, () => insertBook(result.book));
  if (failed) return failed;

  revalidateBookPages();
  redirect(`/?tab=${result.book.status satisfies ReadingStatus}`);
}

export async function saveBookAction(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isOwner())) return NOT_OWNER;

  const book = await findBook(id);
  if (!book) return NOT_FOUND;

  const result = reviseBook(book, bookInput(formData), today());
  if (!result.ok) return { message: result.message };

  const failed = await saveUnlessDuplicate(result.book, () => updateBook(id, result.book), id);
  if (failed) return failed;

  revalidateBookPages(id);
  redirect(`/?tab=${result.book.status}`);
}

export async function deleteBookAction(id: number): Promise<void> {
  if (!(await isOwner())) redirect("/login");

  await deleteBook(id);
  revalidateBookPages(id);
  redirect("/");
}

export async function logInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await logIn(field(formData, "password")))) return { message: "비밀번호가 틀렸습니다." };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logOutAction(): Promise<void> {
  await logOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
