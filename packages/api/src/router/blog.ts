import { TRPCError } from "@trpc/server";
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
    .query(async ({ ctx, input }) => {
      // Fetch the blog posts from the database with pagination
      const { limit, offset } = input;
      console.log({ limit, input });

      const blogs = await ctx.db.blog.findMany({
        take: limit,
        skip: offset,

        orderBy: {
          createdAt: "desc",
        },
        include: {
          medias: true,
        },
      });
      //   const withAudio = blogs.filter(a => a.au)
      //   blogs[0]?.audio
      // Fetch the total count of posts for pagination purposes
      const totalPosts = await ctx.db.blog.count({});
      if (!totalPosts) throw new Error();
      // Check if there are more posts to load
      const hasNextPage = offset + limit < totalPosts;
      const nextCursor = hasNextPage ? offset + limit : null;
      console.log({ totalPosts });

      // Return the paginated blog posts along with nextCursor for infinite scroll
      return {
        posts: blogs,
        nextCursor,
      };
    }),
};
