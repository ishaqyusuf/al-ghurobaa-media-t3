import { webhookCallback } from "grammy";

import type { CommandNames } from "./utils/form-composer";
import {
  createAudioBlog,
  createBlog,
  createPhotoBlog,
} from "./modules/actions";
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
const queue = [];
let running = false;
const jobQueue = async (fn) => {
  if (!fn) return;
  queue.unshift(fn);
  await nextJob();
};

const nextJob = async () => {
  console.log("NEXT JOB");
  setTimeout(async () => {
    if (running) return;
    running = true;
    const job = queue.pop();
    if (!job) return;
    await job();
    setTimeout(async () => {
      running = false;
      // console.log("DONE...");
      // console.log("PENDING...", queue.length);
      await nextJob();
    }, 500);
  }, 1000);
};
// console.log("GLOBAL INIT");

// bot.use(modules);
// bot.command("quit", async (c) => {
//   if (!globalCtx.botInstance) return;
//   globalCtx.botInstance = null;
//   await c.deleteMessage();
//   // const _c = await c.reply("Command Quitted");
// });
bot.on("message:text", async (ctx) => {
  await jobQueue(async () => {
    // if (ctx.message.reply_to_message?.audio?.file_id) {
    //   await ctx.reply(JSON.stringify(ctx.message));
    //   return;
    // }
    await ctx.reply(JSON.stringify(ctx.message));
    awat safeCreateBlog(ctx.message);
  });
  // const cmd = globalCtx?.on?.text?.[globalCtx.botInstance];
  // if (cmd) {
  //   await cmd(ctx);
  //   return;
  // } else {
  // }
  // console.log(ctx.message);
  // await ctx.reply(JSON.stringify(ctx.message));

  // awat safeCreateBlog(ctx.message);
});
bot.on("message:audio", async (ctx) => {
  await jobQueue(async () => {
    // await ctx.reply(JSON.stringify(ctx.message));
    await createAudioBlog(ctx as any);
  });
  // await createAudioBlog(ctx as any);
});
bot.on("message:document", async (ctx) => {});
bot.on("message:photo", async (ctx) => {
  await jobQueue(async () => {
    await createPhotoBlog(ctx as any);
  });
});

export const POST = webhookCallback(bot, "std/http");
