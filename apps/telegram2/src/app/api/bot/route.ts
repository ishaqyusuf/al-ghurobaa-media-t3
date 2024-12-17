import { InlineKeyboard, webhookCallback } from "grammy";

import { createAudioBlog } from "./actions";
import { bot } from "./bot";
import { albumCmdFns, albumCmds } from "./cmd/album-cmd";
import { authorCmdFns, authorCmds } from "./cmd/author-cmd";
import { handleError } from "./handler";

export const dynamic = "force-dynamic";
//
export const fetchCache = "force-no-store";

await bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "help", description: "Show help text" },
  { command: "settings", description: "Open settings" },
]);
let session = {};
export const cmd = {
  cmdIndex: -1,
  cmds: [],
  async goBack(ctx) {
    const _cmd = this.cmds.pop();
    if (_cmd) {
      this.cmdIndex--;
      await _cmd.cmd();
      if (_cmd.canGoBack) await this.backBtn(ctx);
    }
  },
  async backBtn(ctx) {
    const _cmds = new InlineKeyboard().text("Go back", "go_back");
    await ctx.reply("go-back", {
      reply_markup: _cmds,
    });
  },
  async registerCmd(ctx, _cmd, canGoBack = true) {
    await handleError(ctx, async () => {
      if (canGoBack) await this.backBtn(ctx);
      await _cmd();
      this.cmds.push({
        cmd: _cmd,
        canGoBack,
      });
      this.cmdIndex++;
    });
  },
};
bot.command("create_author", async (ctx) => {
  await handleError(ctx, async () => {
    const btns = new InlineKeyboard();

    const titleBtn = ["Oniwiridi", "Ejigbo"].map((title, i) => {
      btns.text(title, `authorTitle:${title}`);
      if (i > 0 && i % 2 == 0) btns.row();
    });
    btns.row();

    btns.text("Custom Title", "custom_title");
    if (!session[ctx.from.id]) session[ctx.from.id] = {};

    await ctx.reply(`Author Name`, {
      reply_markup: btns,
    });
  });
});
const predefinedNames = [
  "Alice",
  "Bob",
  "Charlie",
  "David",
  "Eve",
  "Frank",
  "Grace",
  "Hannah",
];
// bot.inlineQuery()
function suggestCommands(queryText) {
  return predefinedNames
    .filter((name) => name.toLowerCase().includes(queryText))
    .map((name, index) => ({
      type: "article",
      id: String(index),
      title: name,
      input_message_content: {
        message_text: name,
      },
      description: `Select "${name}" as your name`,
    }));
}
const availableCommands = [
  ...authorCmds,
  ...albumCmds,
  // Add more commands as needed
] as const;
let currentCmd: {
  cmd: string;
} = null as any;
const cmdFns = {
  ...authorCmdFns,
  ...albumCmdFns,
};
bot.command("cmd", async (ctx) => {
  const cmds = new InlineKeyboard();
  currentCmd = null;
  availableCommands.map((c, i) => {
    cmds.text(c, c);
    if (i % 2 == 0) cmds.row();
  });
  await cmd.registerCmd(
    ctx,
    async () => {
      await ctx.reply('Select action":', {
        reply_markup: cmds,
      });
    },
    false,
  );
});
bot.command("end", async (ctx) => {
  currentCmd = null;
  session = null;
  await ctx.reply("Cmd end.");
});
bot.on("callback_query:data", async (ctx) => {
  const d = ctx.callbackQuery.data;
  const isRoot = availableCommands.includes(d);
  if (isRoot || !currentCmd) {
    currentCmd = {
      cmd: d,
    };
    session = {};
    await cmdFns[currentCmd.cmd]?.init?.(ctx);
  } else {
    await cmdFns[currentCmd.cmd]?.callback?.(ctx);
  }
  // await ctx.reply(`${d} selected`);
});
bot.on("message:text", async (ctx) => {
  if (currentCmd) {
    await cmd.registerCmd(
      ctx,
      async () => {
        await cmdFns[currentCmd.cmd]?.text?.(ctx);
      },
      true,
    );
    // ctx.message.text
  }
});
bot.on("message:photo", async (ctx) => {
  console.log(">PHOTO");
  // ctx.message.audio
});
bot.on("message:audio", async (ctx) => {
  await handleError(ctx, async () => {
    const resp = await createAudioBlog(ctx.message);
    await ctx.reply(resp, {
      reply_parameters: {
        message_id: ctx.msgId,
        chat_id: ctx.chatId,
      },
    });
  });
  // ctx.message.audio
});
// bot.on("message:text", async (ctx) => {
//   if (ctx.message.text.startsWith("/")) return;
//   const userId = ctx.from.id;

//   // Check if we're expecting a custom title
//   if (session[userId]?.blogTitle === undefined) {
//     session[userId].blogTitle = ctx.message.text; // Store custom title
//     await ctx.reply("Please enter the blog description:");
//   } else if (session[userId]?.blogDescription) {
//     userStates[userId].authorName = ctx.message.text;

//     // Final confirmation message
//     // await ctx.reply(
//     //   `Blog created with Title: ${userStates[userId].blogTitle}, Description: ${userStates[userId].blogDescription}, Author: ${userStates[userId].authorName}`,
//     // );
//   }
// });

// bot.on(":text", async (ctx) => {
//   await handleError(ctx, async () => {
//     console.log(`MSG:`, ctx.message);

//     const author = await getAuthor();
//     console.log({ author });
//     const { forward_origin, audio, photo, text } = ctx.message;
//     // console.log(text);
//     let response = null;
//     const prompt = text?.split("\n")[0];
//     // "".startsWith
//     if (typeof prompt === "string" && prompt.startsWith("/")) {
//       response = await telegramPrompt(prompt.split("/")[1] as any, ctx.message);
//     }
//     if (photo?.length) {
//       response = await createPhotoBlog(ctx.message);
//     }
//     if (audio) {
//       response = await createAudioBlog(ctx.message);
//     }
//     if (response)
//       await ctx.reply(response, {
//         reply_parameters: {
//           message_id: ctx.msgId,
//           chat_id: ctx.chatId,
//         },
//       });
//   });
// });
// await db.insert(Blogs).values({
//   mediaType: "audio",
//   status: "as",
//   telegramId: "adsss",
//   title: "lorem",
//   // au
// });

// bot.on('message')
// bot.on("msg:audio", async (ctx) => {});

// bot.inlineQuery(async (ctx) => {
//   const queryText = ctx.inlineQuery.query.toLowerCase();

//   await ctx.answerInlineQuery(suggestions);
// });
// bot.on("inline_query", async (ctx) => {
//   const userInput = ctx.inlineQuery.query.trim();
//   console.log(">>>>INLINE");
//   // If the user input is empty, return no results
//   if (!userInput) {
//     return await ctx.answerInlineQuery([]);
//   }

//   // Get command suggestions
//   const suggestions = suggestCommands(userInput);

//   // Answer the inline query with suggestions
//   await ctx.answerInlineQuery(suggestions);
// });
export const POST = webhookCallback(bot, "std/http");
