"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteEntry, findPasswordHash, insertEntry, updateMessage } from "@/lib/entries";
import { hashPassword, validateEntry, validateMessage, verifyPassword } from "@/lib/guestbook";

export type FormState = { message: string } | null;

const field = (fd: FormData, name: string) => {
  const v = fd.get(name);
  return typeof v === "string" ? v : "";
};

const WRONG_PASSWORD: FormState = { message: "비밀번호가 일치하지 않아요. 글을 쓸 때 정한 비밀번호를 넣어 주세요." };
const NOT_FOUND: FormState = { message: "글을 찾을 수 없어요. 이미 삭제되었을 수 있어요." };

/** 글 비밀번호 확인. 맞으면 null, 아니면 안내 문구. */
async function checkPassword(id: number, password: string): Promise<FormState> {
  const stored = await findPasswordHash(id);
  if (stored === null) return NOT_FOUND;
  return verifyPassword(password, stored) ? null : WRONG_PASSWORD;
}

export async function createEntryAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const result = validateEntry({ name: field(fd, "name"), message: field(fd, "message"), password: field(fd, "password") });
  if (!result.ok) return { message: result.message };

  const { name, message, password } = result.value;
  await insertEntry({ name, message, passwordHash: hashPassword(password) });
  revalidatePath("/");
  redirect("/");
}

export async function updateEntryAction(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  const message = validateMessage(field(fd, "message"));
  if (!message.ok) return { message: message.message };

  const denied = await checkPassword(id, field(fd, "password"));
  if (denied) return denied;

  await updateMessage(id, message.value);
  revalidatePath("/");
  revalidatePath(`/entries/${id}`);
  redirect(`/entries/${id}`);
}

export async function deleteEntryAction(id: number, _prev: FormState, fd: FormData): Promise<FormState> {
  const denied = await checkPassword(id, field(fd, "password"));
  if (denied) return denied;

  await deleteEntry(id);
  revalidatePath("/");
  redirect("/");
}
