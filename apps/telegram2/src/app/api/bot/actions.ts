import type { Message } from "grammy/types";
import type { z } from "zod";

import type { CreateBlogSchema } from "@acme/db/schema";
import { eq, sql } from "@acme/db";
import { db } from "@acme/db/client";
import {
  Album,
  Blog,
  BlogAudio,
  BlogImage,
  MediaAuthor,
  Thumbnail,
  User,
} from "@acme/db/schema";

import {
  albumsPromptList,
  createAlbumPrompt,
  getAlbumsPrompt,
} from "./album.prompt";
import { telegramChannelId } from "./channel";
import { first } from "./handler";

type CreateBlogDTO = z.infer<typeof CreateBlogSchema>;
// import { User } from "@acme/db/schema";
export async function createThumbnail(msg: Message) {
  if (msg.audio?.thumbnail) {
    const { file_id, file_unique_id, height, width, file_size } =
      msg.audio.thumbnail;
    const s = first(
      await db
        .insert(Thumbnail)
        .values({
          fileId: file_id,
          fileSize: file_size,
          fileUniqueId: file_unique_id,
          height: height,
          width: width,
        })
        .onConflictDoNothing({
          target: [
            Thumbnail.fileId,
            Thumbnail.fileUniqueId,
            Thumbnail.height,
            Thumbnail.width,
          ],
        })
        .returning(),
    );
    return s?.id;
  }

  return null;
}
export async function createAuthor(name) {
  if (!name) return null;
  const author = first(
    await db
      .insert(MediaAuthor)
      .values({
        name,
      })
      .onConflictDoNothing({
        // target: MediaAuthor.name,
        where: sql`name <> '${name}'`,
      })
      .returning(),
  );
  return author;
}
export async function createAudioBlog(msg: Message) {
  // return JSON.stringify({
  //   audio: msg,
  // });
  if (!msg.audio) return "not an audio";
  const thumbnailId = await createThumbnail(msg);
  const author = await createAuthor(msg.audio.performer);
  const audio = first(
    await db
      .insert(BlogAudio)
      .values({
        fileId: msg.audio.file_id,
        duration: msg.audio.duration,
        fileSize: msg.audio.file_size,
        fileName: msg.audio.file_name,
        mimeType: msg.audio.mime_type,
        thumbnailId,
        authorId: author?.id,
        fileUniqueId: msg.audio.file_unique_id,
        performer: msg.audio.performer,
        // performer: msg.audio.thumbnail.
      })
      .returning(),
  );
  // return `${author?.name}`;
  if (!audio) return "unable to create";
  const audioId = audio.id;
  const blog = await createBlog(msg, {
    audioId,
    blogType: "audio",
  });
  if (!blog) return "unable to create";
  return `Blog created: ${blog.id}\ntitle: ${blog.title}\nauthor: ${author?.name}`;
  // const author = await createAuthor(msg);
}
// async function createAuthor(msg: Message) {
//   if (msg.audio) {
//     const authors = await db
//       .insert(MediaAuthor)
//       .values({
//         name: msg.audio.title,
//         meta: {},
//       })
//       .onConflictDoNothing({
//         target: [MediaAuthor.name],
//       })
//       .returning();
//     const author = authors[0];
//     return author.id;
//   }
//   return null;
// }

export async function createBlog(
  msg: Message,
  extras: Partial<CreateBlogDTO> = {},
) {
  const channelId = await telegramChannelId(msg);
  const blogs = await db
    .insert(Blog)
    .values({
      telegramChannelId: channelId,
      telegramMessageId: msg.message_id,
      title: msg.audio?.title,
      description: msg.caption ?? msg.text,
      telegramDate: msg.date,
      ...extras,
      // blogType:
    })
    .returning();
  const blog = blogs[0];
  return blog;
}
export async function createPhotoBlog(msg: Message) {
  const blog = await createBlog(msg);
  if (!blog) return "unable to create";
  await db.insert(BlogImage).values(
    (msg.photo ?? []).map((p) => {
      return {
        height: p.height,
        width: p.width,
        fileId: p.file_id,
        blogId: blog.id,
        fileUniqueId: p.file_unique_id,
        fileSize: p.file_size,
      };
    }),
  );
  return `blogId: ${blog.id}`;
  // await Promise.all(msg.photo?.map(async () ))
}

export async function getAuthor() {
  let firstAuthor = await db.query.User.findFirst({});
  if (!firstAuthor)
    firstAuthor = (
      await db.insert(User).values({
        email: "ishaqyusuf024@gmail.com",
        name: "Ishaq Yusuf",
        password: `...`,
        role: "Admin",
        status: "active",
      })
    ).rows[0];
  return firstAuthor;
}
const promptList = [
  "?",
  ...albumsPromptList,
  "authors",
  "author-schema",
  "update-blog-schema",
  "update-blog",
] as const;
// interface UpdateBlog {
//   mediaIds: number[];
// }
export async function telegramPrompt(p: (typeof promptList)[number], msg) {
  switch (p) {
    case "create-album":
      return await createAlbumPrompt(msg);
    case "albums":
      return await getAlbumsPrompt();
    case "?":
    default:
      return promptList.join("\n");
      break;
  }
}
