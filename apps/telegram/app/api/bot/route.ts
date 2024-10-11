import { webhookCallback } from "grammy";

import type { CommandNames } from "./utils/form-composer";
import modules from "./modules";
import { createAudioBlog, createPhotoBlog } from "./modules/actions";
import { bot } from "./utils/bot";

interface Props {
  botInstance?: CommandNames;
  on: {
    text?: { [cmd in CommandNames]: any };
    audio?: { [cmd in CommandNames]: any };
    file?: { [cmd in CommandNames]: any };
  };
  audioData?: {
    authorId?;
    albumId?;
  };
}
export const globalCtx: Props = {
  on: {
    text: {} as any,
    audio: {} as any,
    file: {} as any,
  },
};
// console.log("GLOBAL INIT");

bot.use(modules);
bot.command("quit", async (c) => {
  if (!globalCtx.botInstance) return;
  globalCtx.botInstance = null;
  await c.deleteMessage();
  // const _c = await c.reply("Command Quitted");
});
bot.on("message:text", async (ctx) => {
  const cmd = globalCtx?.on?.text?.[globalCtx.botInstance];
  if (cmd) {
    await cmd(ctx);
    return;
  } else {
  }
});
bot.on("message:audio", async (ctx) => {
  await createAudioBlog(ctx as any);
});
bot.on("message:document", async (ctx) => {});
bot.on("message:photo", async (ctx) => await createPhotoBlog(ctx as any));

export const POST = webhookCallback(bot, "std/http");
