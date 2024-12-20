export interface ScrapedMessage {
  messageId;
  publishedDate: Date;
  channelId;
}
export type AsyncFn<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

export type MimeType =
  | "application/pdf"
  | "audio/mpeg"
  | "video/mp4"
  | "image/png";
const audioMimeTypes = [
  "audio/mpeg",
  "audio/ogg",
  "audio/aac",
  "audio/mp4",
  "audio/wav",
  "audio/flac",
];
export type BlogType = "text" | "image" | "pdf" | "audio" | "video";
