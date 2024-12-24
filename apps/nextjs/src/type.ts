export interface ScrapedMessage {
  messageId;
  publishedDate: Date;
  channelId;
}
export type AsyncFn<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

export type MimeType =
  | "application/pdf"
  | "audio/mpeg"
  | "audio/MP3"
  | "audio/mp3"
  | "audio/mp4"
  | "audio/m4a"
  | "audio/amr"
  | "audio/aac"
  | "audio/wav"
  | "audio/flac"
  | "audio/ogg"
  | "video/mp4"
  | "image/png"
  | "image/webp";
const audioMimeTypes = [
  "audio/mpeg",
  "audio/ogg",
  "audio/aac",
  "audio/mp4",
  "audio/wav",
  "audio/flac",
];
export type BlogType = "text" | "image" | "pdf" | "audio" | "video";

export interface ChannelMeta {
  scrapeForm: {
    text: boolean;
    document: boolean;
    image: boolean;
    audio: boolean;
  };
}
