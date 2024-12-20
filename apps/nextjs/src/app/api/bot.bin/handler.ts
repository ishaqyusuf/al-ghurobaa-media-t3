export async function handleError(ctx, fn) {
  // await fn();
  // return;
  try {
    await fn();
  } catch (error) {
    if (error instanceof Error) {
      const e = error.message.split("\n")[0];
      if (e) {
        await ctx.reply(e, {
          reply_parameters: {
            message_id: ctx.msgId,
            chat_id: ctx.chatId,
          },
        });
        console.log(`ERROR: ${e}`);
      }
    }
  }
}
export const first = <T>(arr: T[]): T | undefined => arr[0];
