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
}
export async function createBlog(props: Props) {
  let blog;
  const channelId = undefined;
  // if(props.origin?.)
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
    });
    const medias = await db.media.createManyAndReturn({
      data: photo.map((photo, index) => ({
        mimeType: "image/png" as MimeType,
        fileId: files?.[index]?.id,
      })),
    });
    blog = await db.blog.create({
      data: {
        content: message.caption,
        type: "image" as BlogType,
        channelId,
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
      const exists = await db.file.findFirst({
        where: {
          fileId: result.file_id,
        },
      });
      if (exists) {
        console.log("ALREADY SAVED");
        return;
      }
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
          channelId,
          thumbnail: thumbnail
            ? {
                create: {
                  file: {
                    create: {
                      fileId: thumbnail.file_id,
                      fileSize: formatSize(thumbnail.file_size),
                      fileType: "img",
                      mimeType: "image/png" as MimeType,
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
                create: {
                  height,
                  width,
                  duration: duration,
                  mimeType: mime_type,

                  fileId: file_id,
                  fileName: file_name,
                  fileSize: formatSize(file_size),
                  fileType: audio ? "audio" : video ? "video" : "document",
                },
              },
            },
          },
        },
      });
    }
  }
  console.log({ blog, props });

  return blog;
}
