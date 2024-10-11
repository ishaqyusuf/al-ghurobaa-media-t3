import type { FileFlavor } from "@grammyjs/files";
import type { CallbackQueryMiddleware, CommandContext, Context } from "grammy";
import { Bot, BotError, GrammyError, HttpError } from "grammy";

import { env } from "~/env";
import { commandList } from "./form-composer";
import { channel_log, logger } from "./logger";

type ChatContext = Context;
type FileContext = FileFlavor<Context>;
export type MyContext = ChatContext & FileContext;
export type CmdContext = CommandContext<Context>;
export type CallbackQuery = CallbackQueryMiddleware<Context>;
export type ReplyContext = CmdContext["reply"];
export const bot = new Bot(env.TELEGRAM_TOKEN);
await bot.api.setMyCommands(commandList, {});

bot.catch((err) => {
  const ctx = err.ctx;
  const err_template = `while handling update ${ctx.update.update_id.toString()}`;
  const e = err.error;
  if (e instanceof BotError) {
    logger.error(`${err_template} | ${e}`);
  } else if (e instanceof GrammyError) {
    logger.error(`${err_template} | ${e}`);
  } else if (e instanceof HttpError) {
    logger.error(`${err_template} | ${e}`);
  } else if (e instanceof Error) {
    if (e.message != "...") logger.error(`${err_template} | ${e}`);
  } else {
    logger.error(`${err_template} | ${e}`);
  }
  const log =
    `${e}\n\n` +
    `Timestamp: ${new Date().toLocaleString()}\n\n` +
    `Update object:\n${JSON.stringify(ctx.update, null, 2)}`;
  channel_log(log);
});
