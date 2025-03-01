"use server";

import type { Prisma } from "@acme/db";
import { db } from "@acme/db";

import { channels } from "~/app/[domain]/mt-proto/lib";
import { isRTL } from "~/utils/db-utils";

interface SearchParams {
  q: string;
  show?: "scrapes";
}
export async function channelsListDta(searchParams: SearchParams) {
  const where: Prisma.ChannelWhereInput[] = [];
  if (searchParams.q) {
    where.push({
      OR: [
        {
          title: { contains: searchParams.q },
        },
        {
          username: { contains: searchParams.q },
        },
      ],
    });
  }
  switch (searchParams.show) {
    case "scrapes":
      where.push({
        forwards: {
          some: {},
        },
      });
      break;
  }
  const channels = await db.channel.findMany({
    where: where.length > 0 ? { AND: where } : where[0] || undefined,
    select: {
      id: true,
      title: true,
      username: true,
      _count: {
        select: {
          forwards: true,
          blogs: true,
          watchers: true,
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });
  console.log(channels.length);

  return channels.map((channel) => {
    return {
      ...channel,
      title: channel.title || "",
      rtl: isRTL(channel.title),
    };
  });
}
export async function updateChannelListDta() {
  const loadChannels = await channels({});
  const c = await db.channel.findMany({
    select: {
      id: true,
      title: true,
      username: true,
    },
  });
  const createChannels: Prisma.ChannelCreateManyInput[] = [];
  await Promise.all<any>(
    loadChannels
      ?.filter((s) => s.username)
      .map(async (channel) => {
        const existing = c.find((c) => c.username == channel.username);
        if (existing) {
          if (existing.title != channel.title)
            await db.channel.update({
              where: { id: existing.id },
              data: {
                title: channel.title,
              },
            });
        } else {
          createChannels.push({
            username: channel.username,
            title: channel.title,
            createdAt: new Date(),
          });
        }
      }),
  );
  while (createChannels.length) {
    const chunk = createChannels.splice(0, 20);
    await db.channel.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }
}
