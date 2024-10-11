import { CommandNames } from "./form-composer";

type Helper = { [cmd in CommandNames]: {} };
export const __helper: Helper = {} as any;

export const first = <T>(arr: T[]): T | undefined => arr[0];
export const replyParams = (ctx) => ({
  reply_parameters: {
    message_id: ctx.msgId,
    chat_id: ctx.chatId,
  },
});
