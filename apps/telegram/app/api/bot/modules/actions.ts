import type { Message } from "grammy/types";
import type { z } from "zod";

import type { CreateBlogSchema } from "@acme/db/schema";
import { and, eq, sql } from "@acme/db";
import { db } from "@acme/db/client";
import {
  Album,
  Blog,
  BlogAudio,
  BlogImage,
  BlogTag,
  MediaAuthor,
  Tag,
  TelegramChannel,
  Thumbnail,
} from "@acme/db/schema";

import type { MyContext } from "../utils/bot";
import { globalCtx } from "../route";
import { first, replyParams } from "../utils/helper";

type CreateBlogDTO = z.infer<typeof CreateBlogSchema>;
export async function createAudioBlog(ctx: MyContext) {
  const msg = ctx.message;
  const audioData = ctx.message.audio;
  if (!audioData) {
    await ctx.reply(`unable to create`, replyParams(ctx));
    return;
  }
  const gData =
    globalCtx.botInstance == "open_album_for_import"
      ? globalCtx.audioData || {}
      : {};
  const author = gData?.authorId
    ? {
        ...gData,
      }
    : await createAuthor(audioData.performer);
  const thumbnailId = await createThumbnail(msg);

  const audio = first(
    await db
      .insert(BlogAudio)
      .values({
        fileId: audioData.file_id,
        ...gData,
        duration: audioData.duration,
        fileSize: audioData.file_size,
        fileName: audioData.file_name,
        mimeType: audioData.mime_type,
        thumbnailId,
        fileUniqueId: audioData.file_unique_id,
        performer: audioData.performer,
        // performer: msg.audio.thumbnail.
      })
      .returning(),
  );
  if (!audio) {
    return await ctx.reply("unable to create audio", replyParams(ctx));
  }
  const audioId = audio.id;
  const blog = awat safeCreateBlog(msg, {
    audioId,
    blogType: "audio",
    // publishedAt: new Date(),
  });
  if (!blog) return await ctx.reply("unable to create blog", replyParams(ctx));
  await generateTags(blog.id, msg?.caption ?? msg?.text ?? "");

  await ctx.reply(
    [
      `Blog Id: ${blog.id}`,
      `File Name: ${audio.fileName}`,
      `Author: ${author?.name}`,
      `Album Id: ${audio?.albumId}`,
      `Description: ${blog?.description}`,
    ].join("\n"),
    replyParams(ctx),
  );
}
export async function generateTags(blogId, content: string) {
  const tagList = content
    ?.split(" ")
    ?.map((s) => s?.trim())
    .filter((s) => s.startsWith("#"))
    .map((s) => s.replace("#", "").replaceAll("_", " "));
  if (!tagList.length) return;
  const _t = await db
    .insert(Tag)
    .values(
      tagList.map((title) => ({
        title,
      })),
    )
    .onConflictDoNothing({
      target: [Tag.title],
    })
    .returning();
  await db.insert(BlogTag).values(
    _t.map((t) => ({
      blogId,
      tagId: t.id,
    })),
  );
}
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
export async function createBlog(
  msg: Message,
  extras: Partial<CreateBlogDTO> = {},
  ctx?,
) {
  const fuid = msg.reply_to_message?.audio?.file_unique_id;
  if (fuid) {
    const [rse] = await db
      .select()
      .from(BlogAudio)
      .innerJoin(Blog, eq(BlogAudio.id, Blog.audioId))
      .where(eq(BlogAudio.fileUniqueId, fuid));
    // console.log(rse);
    if (rse.blog) {
      await db.update(Blog).set({}).where(eq(Blog.id, rse.blog.id));
      console.log("updated");

      return;
    }
    return;
    // const audio = await db.query.BlogAudio.findFirst({
    //   where: and(eq(BlogAudio.fileUniqueId, fuid)),
    //   with: {
    //     // blog: true,
    //   },
    // });

    // audio.id
  }
  const channelId = await telegramChannelId(msg);
  const blogs = await db
    .insert(Blog)
    .values({
      telegramChannelId: channelId,
      telegramMessageId: msg.message_id,
      title: msg.audio?.title,
      description: msg.caption ?? msg.text,
      telegramDate: msg.date,
      //   publishedAt: new Date(),
      ...extras,
      // blogType:
    })
    .returning();
  const blog = blogs[0];
  return blog;
}
export async function createPhotoBlog(ctx: MyContext) {
  const msg = ctx.message;
  await ctx.reply("UPLOADING...");
  const blog = awat safeCreateBlog(msg);
  if (!blog) {
    await ctx.reply("unable to create");
    return;
  }
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
  const resp = `blogId: ${blog.id}`;
  await ctx.reply(resp);
}
export async function telegramChannelId(msg: Message) {
  const channel = msg.forward_origin;
  if (channel?.type == "channel") {
    const chat = channel.chat;
    const c = (
      await db
        .insert(TelegramChannel)
        .values({
          title: chat.title,
          type: chat.type,
          channelId: chat.id,
          username: chat.username,
        })
        .onConflictDoNothing({
          target: [TelegramChannel.title, TelegramChannel.username],
        })
        .returning()
    )[0];
    return c?.id;
  }
  return null;
}

export async function albumList() {
  const albums = await db.query.Album.findMany({
    with: {
      mediaAuthor: true,
    },
  });
  return albums.map((l) => ({
    label: `${l.name} | ${l.mediaAuthor?.name}`,
    value: `${l.id}`,
  }));
}
export async function albumExists({ id, authorId }) {
  const a = await db.query.Album.findFirst({
    where(fields, operators) {
      return operators.and(
        operators.eq(Album.id, id),
        operators.eq(Album.mediaAuthorId, authorId),
      );
    },
  });
  return a != null;
}
export async function createAlbum({ mediaAuthorId, name, albumType }) {
  const a = await db.insert(Album).values({
    mediaAuthorId,
    name,
    albumType,
  });
}
