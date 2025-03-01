import { createContext, useContext } from "react";
import dayjs from "dayjs";

import { isRTL } from "~/utils/utils";
import { BlogPost } from "../type";

export const BlogContext = createContext(null as any);

export const createBlogContext = (blog: BlogPost) => {
  let date = dayjs(blog.date)?.format("MMM DD, YYYY");
  const chunkText = (blog.caption || blog.content)
    ?.split("\n")
    ?.filter(Boolean)
    ?.join(" ");
  const rtl = isRTL(chunkText);
  return {
    blog,
    date,
    chunkText,
    rtl,
  };
};

export const useBlogContext = () =>
  useContext<ReturnType<typeof createBlogContext>>(BlogContext);
