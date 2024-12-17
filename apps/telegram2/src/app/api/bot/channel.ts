import type { Message } from "grammy/types";

import { db } from "@acme/db/client";
import { TelegramChannel } from "@acme/db/schema";

export async function telegramChannelId(msg: Message) {
  const channel = msg.forward_origin;
  if (channel?.type == "channel") {
    const chat = channel.chat;
    const c = (
      await db
        .insert(TelegramChannel)
        .values({
          title: chat.title,
          type: chat.type,
          channelId: chat.id,
          username: chat.username,
        })
        .onConflictDoNothing({
          target: [TelegramChannel.title, TelegramChannel.username],
        })
        .returning()
    )[0];
    return c?.id;
  }

  return null;
}
