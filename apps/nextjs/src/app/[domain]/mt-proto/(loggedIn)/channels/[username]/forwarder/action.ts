"use server";

import type { Prisma } from "@acme/db";
import { db } from "@acme/db";

import { initializeClient } from "~/app/[domain]/mt-proto/lib";
import { forwardMessage } from "~/app/[domain]/mt-proto/lib/forward-chat";

export async function getForwarderData(username) {
  const channel = await db.channel.findFirstOrThrow({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      watchers: true,
      _count: {
        select: {
          forwards: {
            where: {
              forwardedAt: null,
            },
          },
        },
      },
    },
  });
  const pendingForwardCount = await db.messageForward.count({
    where: {
      channelId: channel.id,
      forwardedAt: null,
    },
  });
  return {
    ...channel,
    pendingForwardCount,
    watchers: channel.watchers.map((watcher) => {
      return {
        watcher,
        fwids: [] as number[],
      };
    }),
    _meta: {
      status: "idle" as "idle" | "loading" | "success" | "error",
      forwardUid: "",
      alert: "",
      count: 0,
      pending: pendingForwardCount,
      records: [],
      forwardCount: 10,
    },
  };
}
interface ForwardProps {
  username;
  uid;
  take?;
  where?: Prisma.MessageForwardWhereInput;
  watcherId?;
}
export async function forwardUseCase({
  username,
  uid,
  take = 10,
  where = {
    forwardedAt: null,
    watcherId: null,
  },
  ...props
}: ForwardProps) {
  const client = await initializeClient();
  const channel = await db.channel.findFirstOrThrow({
    where: { username },
    select: {
      id: true,
      forwards: {
        where,
        take,
      },
    },
  });
  console.log(where);

  return await db.$transaction(
    async (tx) => {
      const fwids = channel?.forwards.map((s) => s.messageId) || [];
      // const date = new Date();
      const forwardedAt = new Date();
      //   date.setSeconds(date.getSeconds() < 30 ? 0 : 30),
      const w = props.watcherId
        ? await tx.messageForwardWatcher.update({
            where: {
              id: props.watcherId,
            },
            data: {
              forwardedAt,
              forwardCount: fwids.length,
              capturedCount: 0,
              status: "in-progress",
            },
          })
        : await tx.messageForwardWatcher.create({
            data: {
              id: uid,
              forwardedAt,
              forwardCount: fwids.length,
              capturedCount: 0,
              status: "in-progress",
              channel: {
                connect: {
                  id: channel.id,
                },
              },
            },
          });
      const ids = await forwardMessage(client, username, fwids);
      if (ids) {
        const resp = await tx.messageForward.updateMany({
          where: {
            messageId: {
              in: fwids,
            },
          },
          data: {
            forwardedAt,
            watcherId: props.watcherId || w.id,
          },
        });
      }
      return {
        fwids,
        watcher: w,
        status: "Forwarded",
      };
    },
    {
      timeout: 10000,
    },
  );
}
export async function reforwardWatcherAction(id) {
  const watcher = await db.messageForwardWatcher.findFirstOrThrow({
    where: {
      id,
    },
    include: {
      channel: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          forwards: {},
        },
      },
    },
  });
  return await forwardUseCase({
    watcherId: id,
    where: {
      watcherId: id,
    },
    take: watcher._count.forwards,
    uid: watcher?.id,
    username: watcher?.channel?.username,
  });
}
export async function deleteMessageForwardWatcherAction(id) {
  await db.messageForward.updateMany({
    where: {
      watcherId: id,
    },
    data: {
      watcherId: null,
      forwardedAt: null,
    },
  });
  await db.messageForwardWatcher.delete({
    where: {
      id,
    },
  });
}
export async function getWatcherAction(id) {
  return await db.messageForwardWatcher.findFirstOrThrow({
    where: {
      id,
    },
  });
}
export async function watcherActionCompletedAction(id) {
  const result = await db.messageForwardWatcher.update({
    where: {
      id,
    },
    data: {
      status: "completed",
    },
    include: {
      blogs: {
        select: { id: true },
      },
      forwards: {
        select: {
          publishedDate: true,
        },
      },
    },
  });
  console.log(result);

  let lastDate: any = null;
  const blogForward = result.blogs.map((blog, index) => {
    let date: any = result.forwards[index]?.publishedDate;
    if (date) lastDate = date;
    else date = lastDate;
    return {
      id: blog.id,
      date,
    };
  });
  // group by same day
  const grouped = blogForward.reduce(
    (acc, blog) => {
      const date = blog.date.toDateString();
      if (!acc[date])
        acc[date] = {
          date: blog.date,
          ids: [],
        };
      acc[date].ids.push(blog.id);
      return acc;
    },
    {} as { ids: number[]; date }[],
  );
  console.log(grouped);

  // promise all update group blogs and set blogDate
  await Promise.all(
    Object.values(grouped).map(async (grp) => {
      const date = grp.date;
      await db.blog.updateMany({
        where: {
          id: {
            in: grp.ids,
          },
        },
        data: {
          blogDate: date,
        },
      });
    }),
  );
}
