"use server";

import type { Message } from "grammy/types";

import { db } from "@acme/db";

import type { BlogType, MimeType } from "~/type";
import { containsOnlyEnglish, formatSize } from "~/utils/db-utils";

interface Props {
  photo?: Message["photo"];
  document?: Message["document"];
  thumbnail?: NonNullable<Message["document"]>["thumbnail"];
  video?: Message["video"];
  message: Message;
  audio?: Message["audio"];
  origin?: Message["forward_origin"];
  text?: boolean;
  ctx?: any;
}
export async function safeCreateBlog(props: Props) {
  // const react = props.ctx.s;
  // console.log("..");
  // await props.ctx.success();
  // return;
  try {
    const r = await createBlog(props);
    await props.ctx.success("👍");
    return r;
  } catch (error) {
    if (error instanceof Error) {
      const e = error.message.split("\n")[0];
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      console.log(error);
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      console.log({ m: error.message });
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      // console.log({ m: error.message });
      // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      const data = [error.message, error.stack]
        .filter(Boolean)
        .join("-------------------------------------------");
      if (error.message)
        await db.telegramError.create({
          data: {
            data,
          },
        });
    } else {
      console.error("UNKNOWN ERROR");
      console.log(error);
    }
    await props.ctx.error("💔");
  }
}
export async function createBlog(props: Props) {
  let blog;
  const watcher = await getCurrentWatcher();
  const watcherId = watcher?.id || undefined;
  const channelId = watcher?.channelId ? watcher.channelId : undefined;
  const { photo, audio, thumbnail, message, video, document } = props;
  if (photo) {
    const files = await db.file.createManyAndReturn({
      data: photo.map((p) => {
        return {
          fileType: "img",
          fileId: p.file_id,
          fileUniqueId: p.file_unique_id,
          width: p.width,
          height: p.height,
          fileSize: formatSize(p.file_size, undefined),
        };
      }),
      skipDuplicates: true,
    });
    blog = await db.blog.create({
      data: {
        content: message.caption,
        type: "image" as BlogType,
        channelId,
        watcherId,
        medias: {
          createMany: {
            data: photo.map((photo, index) => ({
              mimeType: "image/png" as MimeType,
              fileId: files?.[index]?.id,
            })),
          },
        },
      },
    });
  }
  if (!blog) {
    if (props.text) {
      blog = await db.blog.create({
        data: {
          watcherId,
          content: message.text,
          channelId,
          type: "text" as BlogType,
        },
      });
    } else {
      const result = (audio || video || document) as any as NonNullable<
        Message["audio"]
      > &
        NonNullable<Message["video"]>;
      if (!result) return null;
      const {
        height,
        width,
        duration,
        file_id,
        file_unique_id,
        file_name,
        file_size,
        mime_type,
        performer,
        title,
      } = result;
      const performerKey = containsOnlyEnglish(performer) ? "name" : "nameAr";
      blog = await db.blog.create({
        data: {
          content: message.caption,
          type: blogTypeByMime(mime_type),
          channel: channelId
            ? {
                connect: {
                  id: channelId,
                },
              }
            : undefined,
          watcher: watcherId
            ? {
                connect: { id: watcherId },
              }
            : undefined,
          thumbnail: thumbnail
            ? {
                create: {
                  file: {
                    connectOrCreate: {
                      create: {
                        fileId: thumbnail.file_id,
                        fileSize: formatSize(thumbnail.file_size),
                        fileType: "img",
                        mimeType: "image/png" as MimeType,
                        fileUniqueId: thumbnail.file_unique_id,
                      },
                      where: {
                        fileUniqueId: thumbnail.file_unique_id,
                      },
                    },
                  },
                },
              }
            : undefined,
          medias: {
            create: {
              title,
              author: performer
                ? ({
                    connectOrCreate: {
                      create: {
                        [performerKey]: performer,
                      },
                      where: {
                        [performerKey]: performer,
                      },
                    },
                  } as any)
                : undefined,
              mimeType: mime_type as any,
              file: {
                connectOrCreate: {
                  where: {
                    fileUniqueId: file_unique_id,
                  },
                  create: {
                    height,
                    width,
                    duration: duration,
                    mimeType: mime_type,
                    fileUniqueId: file_unique_id,
                    fileId: file_id,
                    fileName: file_name,
                    fileSize: formatSize(file_size),
                    fileType: audio ? "audio" : video ? "video" : "document",
                  },
                },
              },
            },
          },
        },
      });
    }
  }
  if (blog) {
    await messageCaptured(watcherId);
  }
  console.log(blog);
  return blog;
}
function blogTypeByMime(mime): BlogType {
  switch (mime as MimeType) {
    case "application/pdf":
      return "pdf";
    default:
      return mime?.split("/")[0];
  }
}
export async function getCurrentWatcher() {
  const watcher = await db.messageForwardWatcher.findFirst({
    where: {
      status: "in-progress",
      // forwardedAt: {
      //   lte: new Date(Date.now() - 1000 * 60 * 2),
      // },
    },
    include: {
      channel: true,
    },
  });
  return watcher;
}
export async function messageCaptured(watcherId) {
  if (watcherId)
    await db.messageForwardWatcher.update({
      where: { id: watcherId },
      data: {
        capturedCount: {
          increment: 1,
        },
      },
    });
}
export async function clearBlogsAction(channelId?) {
  await db.thumbnail.deleteMany({
    where: !channelId
      ? undefined
      : {
          blogs: {
            every: {
              channelId,
            },
          },
        },
  });
  await db.file.deleteMany({
    where: !channelId
      ? undefined
      : {
          medias: {
            every: {
              blog: {
                channelId,
              },
            },
          },
        },
  });
  await db.media.deleteMany({
    where: !channelId
      ? undefined
      : {
          blog: { channelId },
        },
  });
  await db.blog.deleteMany({
    where: !channelId
      ? undefined
      : {
          channelId,
        },
  });
}
export async function resetChannelBlogAction(channelId) {
  await db.messageForward.updateMany({
    where: { channelId },
    data: {
      forwardedAt: null,
    },
  });
  await db.messageForwardWatcher.deleteMany({
    where: { channelId },
  });
  await clearBlogsAction(channelId);
}
