import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { MoreOrLess } from "react-native-more-or-less-text";
import { Portal } from "@gorhom/portal";

import type { BlogPost } from "../components/type";
import { openBatchMenu } from "~/components/batch-menu";
import Button from "~/components/common/button";
import { _sheet } from "~/components/common/sheet/provider";
import { useStore } from "~/store/store";
import { api } from "~/utils/api";
import { openBlogMenuSheet } from "../components/blog-menu";
import {
  BlogContext,
  createBlogContext,
  useBlogContext,
} from "../components/blog/ctx";
import { LinkChip } from "../components/chip";
import { cn } from "../components/cn";
import { Icon } from "../components/icon";
import { MyAccountIcon } from "../components/my-account-icon";

// export const useBlogs = () =>
export default function Index() {
  const utils = api.useUtils();

  const {
    data,
    status,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    ...ct
  } = api.blog.index.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const flatData = useMemo(() => {
    const result = data?.pages?.flatMap((page) => page.data ?? []) ?? [];
    store?.dotUpdate("blogs", result);
    // return result.filter((a, i) => i < 1);
    return result;
  }, [data?.pages]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to handle refreshing
  const handleRefresh = async () => {
    await refetch();
  };
  const handleScroll = useCallback(
    (event) => {
      const { contentOffset, layoutMeasurement, contentSize } =
        event.nativeEvent;
      const distanceToBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);
    },
    // [fetchNextPage, hasNextPage, isFetchingNextPage],
    [],
  );
  const selectCount = useStore((s) => s.selection?.count);
  const store = useStore();
  const listRef = useRef<FlatList>(null);
  return (
    <View className="bg-muted/90">
      {!selectCount ? null : (
        <View
          className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2 transform flex-row items-center gap-4 rounded-xl bg-purple-800 p-3 px-4",
            !store.sheetOpened && "z-10",
          )}
        >
          {/* <View className="rounded-xl bg-pink-400"> */}
          <Text className="text-white">
            {selectCount}
            {" Selected"}
          </Text>
          <Pressable
            onPress={() => {
              // store.dotUpdate("sheetOpened", true);
              // store.dotUpdate("menuType", "batchSelect");
              openBatchMenu();
            }}
            className="rounded border border-gray-200 p-1"
          >
            <View>
              <Icon icon="menuHorizontal" color={"white"} />
            </View>
          </Pressable>
          {/* </View> */}
        </View>
      )}

      <Portal hostName="header">
        <View className="flex flex-row items-center gap-4 py-2">
          <MyAccountIcon />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            id="tabs"
            className="flex flex-1 flex-row"
          >
            <View className="flex-row items-center gap-2">
              <LinkChip href="/">All</LinkChip>
              <LinkChip href="/?tab=audio">Audio</LinkChip>
              <LinkChip href="/?tab=pictures">Pictures</LinkChip>
              <LinkChip href="/?tab=albums">Albums</LinkChip>
              <LinkChip href="/?tab=authors">Authors</LinkChip>
              <LinkChip href="/?tab=pdfs">Pdfs</LinkChip>
            </View>
          </ScrollView>
        </View>
      </Portal>
      <FlatList
        ref={listRef}
        data={flatData}
        keyExtractor={(item) => item?.id?.toString()}
        renderItem={({ item }) => <Blog item={item} />}
        onScroll={handleScroll}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        refreshControl={
          // Add refresh control
          <RefreshControl
            refreshing={isRefreshing} // Bind refreshing state
            onRefresh={handleRefresh} // Bind refresh handler
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : null
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5} // Load more when 50% from the end
      />
      {/* <BlogMenuSheet />
      <BatchMenuSheet /> */}
    </View>
  );
}

interface BlogProps {
  item: BlogPost;
}
function Blog({ item }: BlogProps) {
  const ctx = createBlogContext(item);
  const store = useStore();
  const selection = useStore((state) => state.selection);
  const selected = store.selection?.items?.[item.id];
  // const [_selected, setSelected] = useState(false);
  // const { selected: _selected, count } = useMemo(() => {
  //   console.log("><>>>>");
  //   return {
  //     selected: store.selections?.[item.id],
  //     count: Object.values(store.selections)?.filter(Boolean)?.length,
  //   };
  // }, [storeSel]);

  const handleLongPress = () => {
    store.dotUpdate(`selection.items.${item.id}`, !selected);
    store.dotUpdate(
      "selection.count",
      Object.values(store.selection.items)?.filter(Boolean)?.length,
    );
    store.dotUpdate("sheetOpened", false);
    // setSelected(!selected);
    // console.log({ selected, count, id: item.id });
  };
  return (
    <BlogContext.Provider value={ctx}>
      <Pressable
        onPress={(e) => {
          if (selection.count > 0) handleLongPress();
          // else {
          //   console.log("!!>>");
          //   _sheet.open({
          //     content: (
          //       <View>
          //         <Text>LOREM </Text>
          //       </View>
          //     ),
          //   });
          // }
        }}
        onLongPress={handleLongPress}
      >
        <View
          className={cn(
            "m-3",
            "rounded-xl bg-muted p-4",
            selected && "bg-red-300",
          )}
        >
          <View className="mb-2 flex flex-row justify-between">
            <MoreOrLess
              numberOfLines={2}
              textStyle={{
                color: "white",
                fontSize: 25,
                fontWeight: "bold",
              }}
              moreText=""
            >
              {ctx.blog.audio?.title || ctx.chunkText}
            </MoreOrLess>
          </View>
          <View className="flex flex-row flex-wrap">
            <Text className={cn("text-white", ctx.rtl && "text-right")}>
              {ctx.date}
            </Text>
            <Text className="w-auto text-white">{" • "}</Text>
          </View>
          <View className="my-4">
            <MoreOrLess
              numberOfLines={2}
              textStyle={{
                color: "gray",
                fontSize: 15,
                fontWeight: "bold",
              }}
            >
              {ctx.blog?.caption || ctx.blog?.content}
            </MoreOrLess>
          </View>
          <View
            className={cn(
              "flex flex-row items-center gap-4",
              selection.count > 0 && "opacity-0",
            )}
          >
            <View className="flex-1"></View>
            <BlogMenu />
            <BlogPlayer />
          </View>
        </View>
      </Pressable>
    </BlogContext.Provider>
  );
}
function BlogMenu({}) {
  const ctx = useBlogContext();
  const store = useStore();
  return (
    <Button
      className="rounded-xl p-2"
      size="icon-md"
      onPress={() => {
        openBlogMenuSheet(ctx.blog);
      }}
      variant={"secondary"}
      icon="menuHorizontal"
    ></Button>
  );
}
function BlogPlayer({}) {
  const ctx = useBlogContext();
  return (
    <Button
      // className="size-10 flex-row items-center justify-center rounded-full bg-white p-2"
      onPress={() => console.log("Button Pressed")}
      size={"icon-md"}
      className="rounded-full"
      // android_ripple={{ color: "rgba(255, 255, 255, 0.3)", radius: 12 }} // Ripple effect on Android
    >
      <Icon icon="play" size={16} fill={"black"} color="black" />
    </Button>
  );
}
