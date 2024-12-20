import type { Context } from "grammy";

import { inArray } from "@acme/db";
import { db } from "@acme/db/client";
import { Blog, BlogAudio } from "@acme/db/schema";

import { createForm } from "./helper";

export const cmdSetBlogAlbum = createForm({
  async onCompleted(ctx: Context, data) {
    await ctx.reply("Adding blogs to album...");

    const [from, to] = data.blogIds?.split("-").map((a) => Number(a));
    const ids = [];
    if (!to) ids.push(from);
    else {
      const count = to - from;
      Array(count + 1)
        .fill(null)
        .map((a, i) => ids.push(i + from));
    }
    console.log(ids);
    const blogs = await db.query.Blog.findMany({
      where: inArray(Blog.id, ids),
      with: {
        audio: true,
      },
    });
    const audioIds = blogs.map((b) => b.audioId).filter((c) => c > 0);
    console.log({ audioIds, albumId: data.albumId });
    await ctx.reply(`Adding audios: ${audioIds.join(",")}`);
    await db
      .update(BlogAudio)
      .set({ albumId: 1, updatedAt: new Date() })
      .where(inArray(BlogAudio.id, audioIds as any));

    await ctx.reply("Audios added to album successfully");
  },
  story(builder) {
    return [
      builder.selectInput("Select Album:!", "albumId", async () => {
        const albums = await db.query.Album.findMany({});
        console.log(albums.length);

        return {
          data: albums,
          renderList(keyboard, item) {
            keyboard.text(`${item.name}`, `${item.id}`);
          },
        };
      }),
      builder.textInput("Blog Ids:", "blogIds"),
    ] as const;
  },
  transform: {},
});
