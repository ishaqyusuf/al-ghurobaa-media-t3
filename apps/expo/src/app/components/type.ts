import type { RouterOutputs } from "@acme/api";

export type BlogPost = RouterOutputs["blog"]["index"]["posts"][number];

export interface CardProps {
  post: BlogPost;
}
