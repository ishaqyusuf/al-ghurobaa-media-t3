import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
// import { FlatList } from "react-native-reanimated/lib/typescript/Animated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";

import type { BlogPost } from "../app/components/type";
import { api } from "~/utils/api";
import { PicturePostCard } from "../app/components/picture-post-card";
import { TextPostCard } from "../app/components/text-post-card";

export default function Index() {
  const utils = api.useUtils();
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    infiniteQueryOptions({
      queryKey: ["posts"],
      // getNextPageParam: (lastPage) => lastPage.nextCursor,
      getNextPageParam: (_lastGroup, groups) => groups.length,
      initialPageParam: 0,
      refetchOnWindowFocus: false,

      queryFn: ({ pageParam = 0 }) => {
        return api.blog.index.useQuery({
          offset: pageParam as any,
          limit: 10,
        });
      },
    }),
  );
  const list = useMemo(() => {
    return data?.pages ? data.pages.flat() : [];
  }, [data]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to handle refreshing
  const handleRefresh = async () => {
    setIsRefreshing(true); // Start refreshing
    await refetch(); // Call your function to refetch posts (adjust to your logic)
    setIsRefreshing(false); // Stop refreshing
  };
  const handleScroll = useCallback(
    (event) => {
      const { contentOffset, layoutMeasurement, contentSize } =
        event.nativeEvent;
      const distanceToBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);

      // Trigger fetch when we are about 5 posts away from reaching the bottom
      if (distanceToBottom < 500 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
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
    // return <View></View>;
    return (
      <View className="border-b border-muted p-4">
        {item.images.length ? (
          <Fragment>
            <PicturePostCard post={item} />
          </Fragment>
        ) : item.audio?.id ? (
          <Fragment>
            <Text className="text-white">AUDIO</Text>
            {/* <AudioPostCard post={item} /> */}
          </Fragment>
        ) : (
          <Fragment>
            <TextPostCard post={item} />
          </Fragment>
        )}
      </View>
    );
  };
  const listRef = useRef<FlatList>(null);
  return (
    <FlatList
      ref={listRef}
      data={list}
      // renderItem={({ item }) => <PostCard post={item} />} // Render your post card
      // keyExtractor={item => item.id}
      keyExtractor={(item) => item?.id.toString()}
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
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : null
      }
      // onEndReached={() => {
      //   if (hasNextPage && !isFetchingNextPage) {
      //     fetchNextPage();
      //   }
      // }}
      // onEndReachedThreshold={0.5} // Load more when 50% from the end
      // ListFooterComponent={
      //   isFetchingNextPage ? (
      //     <ActivityIndicator size="large" />
      //   ) : null
      // }
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
