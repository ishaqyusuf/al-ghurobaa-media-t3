import type { Message } from "grammy/types";

import { db } from "@acme/db/client";
import { Album, MediaAuthor } from "@acme/db/schema";

import { first } from "../handler";
import { cmdSetBlogAlbum } from "./cmd.set-blog-album";
import { createForm, listHelper } from "./helper";

export const albumCmds = [
  "/list_album",
  "/create_album",
  "/set_blog_album",
] as const;

const albumCreator = createForm({
  async onCompleted(ctx, { name, author, albumType, authorId }) {
    await ctx.reply("saving...");
    if (!authorId) {
      await ctx.reply("creating author...");
      authorId = first(
        await db
          .insert(MediaAuthor)
          .values({
            name: author,
            meta: {},
          })
          .returning(),
      )?.id;
      await ctx.reply("author created!");
    }
    await ctx.reply("creating album...");
    await db.insert(Album).values({
      mediaAuthorId: authorId,
      name,
      albumType,
    });
    await ctx.reply("album created");
  },
  story(builder) {
    return [
      builder.textInput("Album Title", "name"),
      builder.selectInput("Author Name", "author", async () => {
        const albums = await db.query.MediaAuthor.findMany({});
        return {
          data: albums,
          renderList(keyboard, item) {
            keyboard.text(`${item.name}`, `${item.id}`);
          },
        };
      }),
      builder.selectInput("Album Type", "albumType", async () => {
        // const albums = await db.query.MediaAuthor.findMany({});
        return {
          data: ["series", "conference"],
          renderList(keyboard, item) {
            keyboard.text(`${item}`, `${item}`);
          },
        };
      }),
    ] as const;
  },
  transform: {
    name: (value, form, mode: "text" | "btn") => {
      if (mode == "btn") form.authorId = value;
      else form.authorId = null;
      return value;
    },
  },
});
export const albumCmdFns: {
  [id in (typeof albumCmds)[number]]: {};
} = {
  "/set_blog_album": cmdSetBlogAlbum.cmds,
  "/create_album": {
    ...albumCreator.cmds,
  },
  "/list_album": {
    init: async (ctx) => {
      const list = await db.query.Album.findMany({
        with: {
          audios: {
            columns: {
              id: true,
            },
          },
          mediaAuthor: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });
      //   console.log(`->${list.length}`);
      return await listHelper({
        ctx,
        list,
        renderList(data, keybrd) {
          return keybrd.text(
            `${data.name} | ${data.mediaAuthor?.name} - ${data.audios.length}`,
            `${data.id}`,
          );
        },
      });
    },

    // callback: _createAuthorCallback,
    // text: _createAuthorText,
  },
};
// let albumForm: {
//   name: string;
//   authorId: number;
//   albumType: string;
//   authorName?: string;
// } = {} as any;
// const albumFormKeys = ["name", "authorId", "albumType", "authorName"] as const;
// const formStory = {};
// const createBlogFormStory = [
//   { key: "name", action: formStory.name },
//   { key: "authorId", action: formStory.authorId },
//   { key: "albumType", action: formStory.albumType },
//   { key: "authorName", action: formStory.authorName },
// ];
