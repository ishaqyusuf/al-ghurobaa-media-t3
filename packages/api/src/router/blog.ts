import { z } from "zod";

import { publicProcedure } from "../trpc";

export const blogRouter = {
  index: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10), // number of posts to fetch
        offset: z.number().nonnegative().default(0), // pagination offset
      }),
    )
    .query(({ ctx, input }) => {
      // ctx.db.
      return {};
    }),
};
