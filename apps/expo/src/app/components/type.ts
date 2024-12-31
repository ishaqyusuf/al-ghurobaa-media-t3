import type { RouterOutputs } from "@acme/api";

export type BlogPost = RouterOutputs["blog"]["index"]["data"][number];

export interface CardProps {
  post: BlogPost;
}
