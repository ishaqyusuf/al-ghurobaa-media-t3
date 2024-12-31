import { z } from "zod";

import type { BlogType } from "../type";
import { blogQueryDta } from "../data-access/blog-dta";
import { blogDto } from "../dto/blog-dto";
import { publicProcedure } from "../trpc";
import { getNextCursor } from "../utils/db-utils";

export const blogRouter = {
  index: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10), // number of posts to fetch
        cursor: z.number().nonnegative().default(0), // pagination offset
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await blogQueryDta(input);
      const nextCursor = await getNextCursor(ctx.db.blog, input);
      return {
        data: data.map(blogDto),
        nextCursor,
      };
      // Fetch the blog posts from the database with pagination
      // const { limit, cursor } = input;
      // console.log({ input });
      // const offset = cursor * limit;
      // const blogs = await ctx.db.blog.findMany({
      //   take: limit,
      //   skip: offset,

      //   orderBy: {
      //     createdAt: "desc",
      //   },
      //   include: {
      //     medias: {
      //       include: {
      //         file: true,
      //       },
      //     },
      //   },
      // });
      //   const withAudio = blogs.filter(a => a.au)
      //   blogs[0]?.audio
      // Fetch the total count of posts for pagination purposes
      //   const totalPosts = await ctx.db.blog.count({});
      //   if (!totalPosts) throw new Error();
      //   // Check if there are more posts to load
      //   const hasNextPage = offset + limit < totalPosts;
      //   const nextCursor = hasNextPage ? offset + limit : null;

      //   // Return the paginated blog posts along with nextCursor for infinite scroll
      //   return {
      //     data: blogs.map((blog) => {
      //       const { medias, ...rest } = blog;
      //       const type: BlogType = rest.type as any;
      //       const caption = type == "text" ? null : rest.content;
      //       const text = type == "text" ? rest.content : null;

      //       return {
      //         id: blog.id,
      //         caption,
      //         text,
      //       };
      //     }),
      //     nextCursor,
      //   };
    }),
};
