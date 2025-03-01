import { Text, View } from "react-native";

import { cn } from "../cn";
import { BlogPost } from "../type";
import { BlogContext, createBlogContext } from "./ctx";

interface BlogProps {
  item: BlogPost;
}
export function Blog({ item }: BlogProps) {
  const ctx = createBlogContext(item);
  //lorem
  return (
    <BlogContext.Provider value={ctx}>
      <View
        className={cn(
          "m-2",

          "rounded-xl bg-muted p-4",
        )}
      >
        <Text className={cn("text-white", ctx.rtl && "text-rights")}>
          {ctx.date}
          {ctx.chunkText}
        </Text>
      </View>
    </BlogContext.Provider>
  );
}
