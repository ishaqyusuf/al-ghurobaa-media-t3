import { pgTable } from "drizzle-orm/pg-core";

import { Blog } from "./blog-schema";
import { __serialPri, _serialRel, _uuidRel, timeStamps } from "./schema-helper";
import { User } from "./user-schema";

export const BlogViews = pgTable("blog_views", {
  id: __serialPri,
  blogId: _serialRel("blog_id", Blog.id).notNull(),
  userId: _uuidRel("user_id", User.id), // Optional for logged-in users
  ...timeStamps,
});

export const BlogLikes = pgTable("blog_likes", {
  id: __serialPri,
  blogId: _serialRel("blog_id", Blog.id).notNull(),
  userId: _uuidRel("user_id", User.id).notNull(),
  ...timeStamps,
});
