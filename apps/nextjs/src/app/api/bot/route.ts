import { webhookCallback } from "grammy";

import { db, Prisma } from "@acme/db";

import { createBlog } from "~/data-access/blog.dta";
import { lastId, nextId } from "~/utils/db-utils";
import { bot } from "./bot";

export const dynamic = "force-dynamic";

export const fetchCache = "force-no-store";

bot.on("message:text", async (ctx) => {
  // console.log(ctx);
  // console.log(ctx.message);
  // return;
  await createBlog({
    message: ctx.message,
    text: true,
  });
});

bot.on("message:video", async (ctx) => {
  const msg = ctx.message;
  await createBlog({
    message: ctx.message,
    video: ctx.message.video,
    thumbnail: ctx.message.video.thumbnail,
    origin: ctx.message.forward_origin,
  });
  console.log(msg);
});
bot.on("message:document", async (ctx) => {
  const msg = ctx.message;
  await createBlog({
    message: ctx.message,
    document: ctx.message.document,
    origin: ctx.message.forward_origin,
    thumbnail: ctx.message.document?.thumbnail,
  });

  console.log(msg);
});
bot.on("message:photo", async (ctx) => {
  await createBlog({
    message: ctx.message,
    photo: ctx.message.photo,
    origin: ctx.message.forward_origin,
  });
});
bot.on("message:audio", async (ctx) => {
  const msg = ctx.message;
  const audio = ctx.message.audio;
  console.log(msg);

  await createBlog({
    audio,
    thumbnail: msg.audio.thumbnail,
    message: msg,
    origin: ctx.message.forward_origin,
  });
});

export const POST = webhookCallback(bot, "std/http");
