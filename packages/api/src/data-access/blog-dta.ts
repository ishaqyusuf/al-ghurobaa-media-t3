import { db } from "@acme/db";

import { AsyncFnType } from "../type";

export type BlogQueryDta = AsyncFnType<typeof blogQueryDta>;
export async function blogQueryDta(params) {
  const { limit, cursor } = params;
  const offset = cursor * limit;
  const blogs = await db.blog.findMany({
    take: limit,
    skip: offset,

    orderBy: {
      createdAt: "desc",
    },
    include: {
      medias: {
        include: {
          author: true,
          albumAudioIndex: true,
          album: {
            include: {
              author: true,
            },
          },
          file: true,
        },
      },
    },
  });
  return blogs;
}
