import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";

import type { BlogPost } from "./components/type";
import { api } from "~/utils/api";
import AudioPostCard from "./components/audio-post-card";
import { PicturePostCard } from "./components/picture-post-card";
import { TextPostCard } from "./components/text-post-card";

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

  // const {
  //   data,
  //   isLoading,
  //   hasNextPage,
  //   fetchNextPage,
  //   isFetchingNextPage,
  //   isRefetching,
  //   refetch,
  //   status,
  // } = useInfiniteQuery(
  //   infiniteQueryOptions({
  //     queryKey: ["posts"],
  //     getNextPageParam: (_lastGroup, groups) => groups.length,
  //     initialPageParam: 0,
  //     refetchOnWindowFocus: false,
  //     // throwOnError(error, query) {
  //     //   console.error(error);
  //     // },
  //     queryFn: ({ pageParam = 0 }) => {
  //       try {
  //         return api.blog.index.useQuery({
  //           offset: pageParam,
  //           limit: 10,
  //         });
  //       } catch (error) {
  //         console.error("Error fetching posts:", error);
  //         throw error;
  //       }
  //     },
  //   }),
  // );
  const flatData = useMemo(() => {
    const result = data?.pages?.flatMap((page) => page.data ?? []) ?? [];
    // return result.filter((a, i) => i < 1);
    return result;
  }, [data?.pages]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to handle refreshing
  const handleRefresh = async () => {
    await refetch();
    console.log("REFETCHING");
  };
  const handleScroll = useCallback(
    (event) => {
      const { contentOffset, layoutMeasurement, contentSize } =
        event.nativeEvent;
      const distanceToBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);

      // Trigger fetch when we are about 5 posts away from reaching the bottom
      // if (distanceToBottom < 500 && hasNextPage && !isFetchingNextPage) {
      //   fetchNextPage();
      // }
    },
    // [fetchNextPage, hasNextPage, isFetchingNextPage],
    [],
  );
  // const onViewableItemsChanged = ({ viewableItems }) => {
  //   viewableItems.forEach(({ item }) => {
  //     if (item.picture && !isPictureLoaded(item.id)) {
  //       // Trigger image loading
  //       loadImage(item.picture.fileId);
  //     }
  //   });
  // };
  const renderPostCard = ({ item }: { item: BlogPost }) => {
    const type = item.type;
    return (
      <View className="border-y border-muted-foreground/20 p-2 px-4">
        {type == "text" && <TextPostCard post={item} />}
        {item.audio && <AudioPostCard post={item} />}
      </View>
    );
    return (
      <View>
        <Text>{item.id}</Text>
      </View>
    );
    // return (
    //   <View className="border-b border-muted p-4">
    //     {item.images.length ? (
    //       <Fragment>
    //         <PicturePostCard post={item} />
    //       </Fragment>
    //     ) : item.audio?.id ? (
    //       <Fragment>
    //         <Text className="text-white">AUDIO</Text>
    //         {/* <AudioPostCard post={item} /> */}
    //       </Fragment>
    //     ) : (
    //       <Fragment>
    //         <TextPostCard post={item} />
    //       </Fragment>
    //     )}
    //   </View>
    // );
  };
  const listRef = useRef<FlatList>(null);
  return (
    <FlatList
      ref={listRef}
      data={flatData}
      // renderItem={({ item }) => <PostCard post={item} />} // Render your post card
      // keyExtractor={item => item.id}
      keyExtractor={(item) => item?.id?.toString()}
      renderItem={renderPostCard}
      onScroll={handleScroll}
      viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      refreshControl={
        // Add refresh control
        <RefreshControl
          refreshing={isRefreshing} // Bind refreshing state
          onRefresh={handleRefresh} // Bind refresh handler
        />
      }
      ListHeaderComponent={
        <View>
          <Text>LIST HEADER</Text>
          {/* <Text>{(isRefetching || isLoading) && "REFETCHING>>>"}</Text> */}
          <Text>{status}</Text>
          {/* <Text>{JSON.stringify(data || {})}</Text> */}
        </View>
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
  );

  return (
    <SafeAreaView className="bg-background">
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "Home" }} />
      <View></View>
    </SafeAreaView>
  );
}
