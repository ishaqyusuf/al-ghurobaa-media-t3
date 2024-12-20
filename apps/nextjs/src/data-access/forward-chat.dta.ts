"use server";

import { db } from "@acme/db";

import { AsyncFn, ScrapedMessage } from "~/type";

export async function getChannelWithLastScrapeMessageId(username, title?) {
  const channel = await db.channel.upsert({
    where: {
      username,
      deletedAt: null,
    },
    create: {
      title: title,
      username,
    },
    update: {},
    include: {
      forwards: {
        take: 1,
        select: {
          messageId: true,
        },
        orderBy: {
          messageId: "desc",
        },
      },
    },
  });
  const { forwards, ...data } = channel;
  return {
    channel: data,
    lastMessageId: forwards?.[0]?.messageId,
  };
}
export async function registerIncomingMessages(list: ScrapedMessage[]) {
  const messages = await getUniqueMessages(list);
  const c = await db.messageForward.createManyAndReturn({
    data: messages as any,
    skipDuplicates: true,
  });
  return c.map((s) => s.messageId);
}
export async function getUniqueMessages(list: ScrapedMessage[]) {
  if (list.length == 0) return [];
  const { channelId } = list[0] || {};
  const existingChats = await db.messageForward.findMany({
    select: { messageId: true },
    where: {
      channel: {
        id: channelId,
      },
    },
  });
  const ids = existingChats.map((s) => s.messageId);
  return list.filter((s) => !ids.includes(s.messageId));
}
export type GetChatHistory = AsyncFn<typeof getChatHistory>;
export async function getChatHistory(username) {
  const channel = await db.channel.findUnique({
    where: { username, deletedAt: null },
    include: {
      forwards: {
        select: {
          id: true,
        },
      },
      blogs: {
        select: {
          id: true,
          _count: true,
        },
      },
    },
  });
  return channel;
}
export async function clearChannelRecord(username) {
  await db.messageForward.deleteMany({
    where: {
      channel: {
        username,
      },
    },
  });
  await db.blog.deleteMany({
    where: {
      channel: { username },
    },
  });
}
