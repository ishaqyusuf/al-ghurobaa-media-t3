import { authRouter } from "./router/auth";
import { blogRouter } from "./router/blog.router";
import { bootstrapRouter } from "./router/bootstrap";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  bootstrap: bootstrapRouter,
  blog: blogRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
