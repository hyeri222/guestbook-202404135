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
import {
  type ReadingStatus,
  type RuleResult,
  type StatusChange,
  changeStatus,
  editDetails,
  registerBook,
} from "@/lib/books/rules";
import { today } from "@/lib/today";

export type FormState = { message: string; duplicateOf?: number } | null;

const NOT_OWNER: FormState = { message: "주인만 기록을 바꿀 수 있습니다. 먼저 로그인해 주세요." };
const NOT_FOUND: FormState = { message: "책을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다." };
const DUPLICATE = (id: number): FormState => ({ message: "이미 있는 책입니다.", duplicateOf: id });

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function statusField(formData: FormData): ReadingStatus {
  const value = field(formData, "status");
  return value === "reading" || value === "finished" ? value : "want_to_read";
}

function failure(result: Extract<RuleResult, { ok: false }>): FormState {
  return { message: result.message };
}

function refresh(id?: number) {
  revalidatePath("/");
  if (id !== undefined) revalidatePath(`/books/${id}`);
}

export async function registerBookAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isOwner())) return NOT_OWNER;

  const status = statusField(formData);
  const result = registerBook(
    {
      title: field(formData, "title"),
      author: field(formData, "author"),
      status,
      startedOn: field(formData, "startedOn"),
      rating: field(formData, "rating"),
      review: field(formData, "review"),
      finishedOn: field(formData, "finishedOn"),
    },
    today(),
  );
  if (!result.ok) return failure(result);

  const duplicateId = await findDuplicateId(result.book);
  if (duplicateId !== null) return DUPLICATE(duplicateId);

  try {
    await insertBook(result.book);
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
    const id = await findDuplicateId(result.book);
    return id === null ? { message: "이미 있는 책입니다." } : DUPLICATE(id);
  }

  refresh();
  redirect(`/?tab=${status}`);
}

export async function editBookAction(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isOwner())) return NOT_OWNER;

  const book = await findBook(id);
  if (!book) return NOT_FOUND;

  const result = editDetails(book, { title: field(formData, "title"), author: field(formData, "author") });
  if (!result.ok) return failure(result);

  const duplicateId = await findDuplicateId(result.book);
  if (duplicateId !== null && duplicateId !== id) return DUPLICATE(duplicateId);

  try {
    await updateBook(id, result.book);
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
    const otherId = await findDuplicateId(result.book);
    return otherId === null ? { message: "이미 있는 책입니다." } : DUPLICATE(otherId);
  }

  refresh(id);
  redirect(`/books/${id}`);
}

export async function changeStatusAction(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isOwner())) return NOT_OWNER;

  const book = await findBook(id);
  if (!book) return NOT_FOUND;

  const to = field(formData, "to");
  const change: StatusChange =
    to === "reading"
      ? { to, startedOn: field(formData, "startedOn") }
      : to === "finished"
        ? {
            to,
            rating: field(formData, "rating"),
            review: field(formData, "review"),
            finishedOn: field(formData, "finishedOn"),
            // 평가 고치기 폼에만 시작한 날 칸이 있다. 칸이 없으면 그대로 둔다.
            startedOn: formData.has("startedOn") ? field(formData, "startedOn") : undefined,
          }
        : { to: "want_to_read" };

  const result = changeStatus(book, change, today());
  if (!result.ok) return failure(result);

  await updateBook(id, result.book);
  refresh(id);
  redirect(`/books/${id}`);
}

export async function deleteBookAction(id: number): Promise<void> {
  if (!(await isOwner())) throw new Error("주인만 책을 삭제할 수 있습니다.");

  await deleteBook(id);
  refresh(id);
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
  redirect("/");
}
