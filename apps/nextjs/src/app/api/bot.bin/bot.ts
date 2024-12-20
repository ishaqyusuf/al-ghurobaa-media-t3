import { Bot, GrammyError, HttpError } from "grammy";

import { env } from "~/env";

const token = env.TELEGRAM_TOKEN;

if (!token)
  throw new Error("TELEGRAM_BOT_TOKEN environment variable not found.");

export const bot = new Bot(token);

bot.catch(({ ctx, error }) => {
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  if (error instanceof GrammyError) {
    console.error("Error in request:", error.description);
  } else if (error instanceof HttpError) {
    console.error("Could not contact Telegram:");
  } else {
    console.error("Unknown error:");
  }
  console.log(error);
});
// export type Message = NonNullable<
//   Awaited<ReturnType<RawApi["getUpdates"]>>[number]["callback_query"]
// >["message"];
