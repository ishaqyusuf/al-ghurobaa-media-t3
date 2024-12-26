import { webhookCallback } from "grammy";

import { safeCreateBlog } from "~/data-access/blog.dta";
import { bot } from "./bot";

export const dynamic = "force-dynamic";

export const fetchCache = "force-no-store";
const __args = (ctx) => ({
  success: async () => await ctx.react("👍"),
  error: async () => await ctx.react("💔"),
});
bot.on("message:text", async (ctx) => {
  await safeCreateBlog({
    message: ctx.message,
    text: true,
    ctx: __args(ctx),
  });
});

bot.on("message:video", async (ctx) => {
  await safeCreateBlog({
    message: ctx.message,
    video: ctx.message.video,
    thumbnail: ctx.message.video.thumbnail,
    origin: ctx.message.forward_origin,
    ctx: __args(ctx),
  });
});
bot.on("message:document", async (ctx) => {
  await safeCreateBlog({
    message: ctx.message,
    document: ctx.message.document,
    origin: ctx.message.forward_origin,
    thumbnail: ctx.message.document?.thumbnail,
    ctx: __args(ctx),
  });
});
bot.on("message:photo", async (ctx) => {
  await safeCreateBlog({
    message: ctx.message,
    photo: ctx.message.photo,
    origin: ctx.message.forward_origin,
    ctx: __args(ctx),
  });
});
bot.on("message:audio", async (ctx) => {
  const msg = ctx.message;
  const audio = ctx.message.audio;
  await safeCreateBlog({
    audio,
    thumbnail: msg.audio.thumbnail,
    message: msg,
    origin: ctx.message.forward_origin,
    ctx: __args(ctx),
  });
});

export const POST = webhookCallback(bot, "std/http");
