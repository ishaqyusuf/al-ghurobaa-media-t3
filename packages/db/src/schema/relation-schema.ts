import { relations } from "drizzle-orm";

import {
  Album,
  AlbumIndex,
  Blog,
  BlogAudio,
  BlogImage,
  BlogNote,
  Comment,
  Thumbnail,
} from "./blog-schema";
import { BlogTag, Tag } from "./tag-schema";
import {
  Account,
  MediaAuthor,
  Notification,
  Session,
  TelegramChannel,
  User,
} from "./user-schema";

// Adjust imports based on your project structure

export const BlogRelations = relations(Blog, ({ one, many }) => ({
  author: one(User, {
    fields: [Blog.authorId],
    references: [User.id],
  }),
  telegramChannel: one(TelegramChannel, {
    fields: [Blog.telegramChannelId],
    references: [TelegramChannel.id],
  }),
  audio: one(BlogAudio, {
    fields: [Blog.audioId],
    references: [BlogAudio.id],
  }),
  notes: many(BlogNote),
  images: many(BlogImage),
  tags: many(BlogTag),
}));
export const BlogImageRelations = relations(BlogImage, ({ one, many }) => ({
  blog: one(Blog, {
    fields: [BlogImage.blogId],
    references: [Blog.id],
  }),
}));
export const BlogAudioRelations = relations(BlogAudio, ({ one }) => ({
  author: one(MediaAuthor, {
    fields: [BlogAudio.authorId],
    references: [MediaAuthor.id],
  }),
  album: one(Album, {
    fields: [BlogAudio.albumId],
    references: [Album.id],
  }),
  blog: one(Blog, {
    fields: [BlogAudio.id],
    references: [Blog.audioId],
  }),
  thumbnail: one(Thumbnail, {
    fields: [BlogAudio.thumbnailId],
    references: [Thumbnail.id],
  }),
}));
export const UserRelation = relations(User, ({ many }) => ({
  Blogs: many(Blog),
  notes: many(BlogNote),
}));

export const AlbumRelation = relations(Album, ({ one, many }) => ({
  thumbnail: one(Thumbnail, {
    fields: [Album.thumbnailId],
    references: [Thumbnail.id],
  }),
  mediaAuthor: one(MediaAuthor, {
    fields: [Album.mediaAuthorId],
    references: [MediaAuthor.id],
  }),
  albumIndices: many(AlbumIndex),
  audios: many(BlogAudio),
}));

export const TagRelation = relations(Tag, ({ many }) => ({
  BlogTag: many(BlogTag),
}));
export const CommentRelation = relations(Comment, ({ one }) => ({
  blog: one(Blog, {
    fields: [Comment.blogId],
    references: [Blog.id],
  }),
  user: one(User, {
    fields: [Comment.userId],
    references: [User.id],
  }),
}));

export const NotificationRelation = relations(Notification, ({ one }) => ({
  user: one(User, {
    fields: [Notification.userId],
    references: [User.id],
  }),
}));
export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}));
export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}));
// export const versionControlRelations = relations(blogVersions, ({ one }) => ({
//   blog: one(Blogs, {
//     fields: [blogVersions.blogId],
//     references: [Blogs.id],
//   }),
//   editor: one(users, {
//     fields: [blogVersions.editedBy],
//     references: [User.id],
//   }),
// }));
