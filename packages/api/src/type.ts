import type { RouterOutputs } from ".";

export type BlogType = "text" | "image" | "pdf" | "audio" | "video";

export type BlogDto = RouterOutputs["blog"]["index"]["data"][number];
export type AsyncFnType<T extends (...args: any) => any> = Awaited<
  ReturnType<T>
>;
export type AlbumType = "series" | "conference";
