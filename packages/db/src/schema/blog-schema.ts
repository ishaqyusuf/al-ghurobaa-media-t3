import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

import { __serialPri, _serialRel, _uuidRel, timeStamps } from "./schema-helper";
import { MediaAuthor, TelegramChannel, User } from "./user-schema";

export const Thumbnail = pgTable("thumbnail", {
  id: __serialPri,
  fileId: varchar("file_id", { length: 200 }),
  width: integer("width"),
  height: integer("height"),
  fileUniqueId: varchar("file_unique_id", { length: 50 }),
  fileSize: integer("file_size"),
  ...timeStamps,
});
export const Album = pgTable("album", {
  id: __serialPri,
  name: text("name").notNull(),
  albumType: varchar("album_type", {
    length: 200,
    enum: ["series", "conference"],
  }),
  mediaAuthorId: _serialRel("media_author_id", MediaAuthor.id),
  thumbnailId: _serialRel("thumbnail_id", Thumbnail.id),
  ...timeStamps,
});

export const BlogAudio = pgTable("blog_audio", {
  id: __serialPri,
  fileId: varchar("file_id", { length: 200 }),
  mimeType: varchar("mime_type", { length: 200 }),
  performer: varchar("performer", { length: 200 }),
  title: varchar("title", { length: 200 }),
  fileName: varchar("file_name", { length: 200 }),
  duration: integer("duration"),
  fileUniqueId: varchar("file_unique_id", { length: 50 }),
  authorId: _serialRel("author_id", MediaAuthor.id),
  fileSize: integer("file_size"),
  albumId: _serialRel("album_id", Album.id),
  publishedAt: timestamp("published_at"),
  thumbnailId: _serialRel("thumbnail_id", Thumbnail.id),
  ...timeStamps,
});

export const AlbumIndex = pgTable("album_index", {
  id: __serialPri,
  albumId: _serialRel("album_id", Album.id),
  audioId: _serialRel("audio_id", BlogAudio.id),
  mediaIndex: integer("media_index").notNull(),
  ...timeStamps,
});
export const Blog = pgTable("blog", {
  id: __serialPri,
  telegramMessageId: integer("telegram_message_id"),
  // mediaType: varchar("media_type", { length: 20 }).notNull(),
  blogType: varchar("blog_type", {
    length: 20,
    enum: ["text", "audio", "image"],
  }),
  title: text("title"),
  description: text("description"),
  status: varchar("status", { length: 20 }),
  published: boolean("published").default(false),
  meta: jsonb("meta").default({}),
  authorId: _uuidRel("author_id", User.id),
  audioId: _serialRel("audio_id", BlogAudio.id),
  publishedAt: timestamp("published_at"),
  telegramDate: integer("date"),
  telegramChannelId: _serialRel("telegram_channel_id", TelegramChannel.id),
  ...timeStamps,
});
export const BlogImage = pgTable("blog_image", {
  id: __serialPri,
  fileId: varchar("file_id", { length: 200 }),
  width: integer("width"),
  height: integer("height"),
  blogId: _serialRel("blog_id", Blog.id).notNull(),
  fileUniqueId: varchar("file_unique_id", { length: 50 }),
  fileSize: integer("file_size"),
  ...timeStamps,
});
export const CreateBlogSchema = createInsertSchema(Blog);
export const CreateBlogImageSchema = createInsertSchema(BlogImage);
export const BlogNote = pgTable("blog_note", {
  id: __serialPri,
  userId: _uuidRel("user_id", User.id),
  note: text("note").notNull(),
  blogId: _serialRel("blog_id", Blog.id).notNull(),
  status: varchar("status", { length: 20 }),
  published: boolean("published").default(false),
  ...timeStamps,
});

export const Comment = pgTable("comments", {
  id: __serialPri,
  blogId: _serialRel("blog_id", Blog.id).notNull(),
  commentBlogId: _serialRel("comment_blog_id", Blog.id).notNull(),
  userId: _uuidRel("user_id", User.id).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // e.g., "approved", "pending", "rejected"
  ...timeStamps,
});
