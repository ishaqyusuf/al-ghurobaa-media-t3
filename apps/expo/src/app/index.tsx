import { useCallback, useRef, useState } from "react";
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

import type { BlogPost } from "./components/type";
import { api } from "~/utils/api";
import AudioPostCard from "./components/audio-post-card";
import { PicturePostCard } from "./components/picture-post-card";
import { TextPostCard } from "./components/text-post-card";

export default function Index() {
  const utils = api.useUtils();
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = api.blog.index.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor, // Pagination key
    },
  );
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
          <>
            <PicturePostCard post={item} />
          </>
        ) : item.audio?.id ? (
          <>
            <Text className="text-white">AUDIO</Text>
            {/* <AudioPostCard post={item} /> */}
          </>
        ) : (
          <>
            <TextPostCard post={item} />
          </>
        )}
      </View>
    );
  };
  const listRef = useRef<FlatList>(null);
  return (
    <FlatList
      ref={listRef}
      data={data?.pages.flatMap((page) => page.posts) || []}
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
