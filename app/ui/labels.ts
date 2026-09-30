import type { ReadingStatus } from "@/lib/books/rules";

export const STATUS_LABELS: Record<ReadingStatus, string> = {
  want_to_read: "읽고 싶음",
  reading: "읽는 중",
  finished: "다 읽음",
};

export const STATUSES = Object.keys(STATUS_LABELS) as ReadingStatus[];

export function isStatus(value: unknown): value is ReadingStatus {
  return typeof value === "string" && value in STATUS_LABELS;
}

export function formatRating(rating: number): string {
  return `★ ${rating.toFixed(1)}`;
}
