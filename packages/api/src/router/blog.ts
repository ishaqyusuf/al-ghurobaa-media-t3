import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, count, desc } from "@acme/db";
import { Blog } from "@acme/db/schema";

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

      const blogs = await ctx.db.query.Blog.findMany({
        limit, // Number of posts to fetch
        offset, // Number of posts to skip (for pagination)
        orderBy: desc(Blog.createdAt),
        with: {
          audio: true, // Include associated audio
          images: true, // Include associated images
        },
      });

      // Fetch the total count of posts for pagination purposes
      const totalPosts = await ctx.db
        .select({ count: count() })
        .from(Blog)
        .where(and());
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
