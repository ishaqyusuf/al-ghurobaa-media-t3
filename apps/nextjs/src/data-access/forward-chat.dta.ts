"use server";

import { db } from "@acme/db";

import type { AsyncFn, ChannelMeta, ScrapedMessage } from "~/type";

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
    data: messages.map((data) => {
      return {
        ...data,
        status: "queue",
      };
    }),
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
export type GetChannelStat = AsyncFn<typeof getChatStat>;
export async function getChatStat(username) {
  const channel = await db.channel.findUniqueOrThrow({
    where: {
      username,
    },
    select: {
      id: true,
      meta: true,
      title: true,
      _count: {
        select: {
          blogs: true,
        },
      },
      forwards: {
        take: 1,
        orderBy: {
          messageId: "asc",
        },
      },
    },
  });
  const scrapedMsgs = await db.messageForward.count({
    where: { channelId: channel.id },
  });
  const forwardedMsgs = await db.messageForward.count({
    where: { channelId: channel.id, forwardedAt: { not: null } },
  });
  const { forwards, _count, meta = {}, ...rest } = channel;
  return {
    ...rest,
    lastMessageId: forwards[0]?.messageId,
    meta: meta as any as ChannelMeta,
    stat: {
      scraped: scrapedMsgs,
      forwared: forwardedMsgs,
      blogs: _count.blogs,
    },
  };
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
