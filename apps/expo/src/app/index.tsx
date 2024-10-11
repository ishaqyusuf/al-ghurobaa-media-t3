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
  const handlePostInView = (post, inViewCallback) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          inViewCallback();
          observer.disconnect(); // Stop observing once image is loaded
        }
      },
      { threshold: 0.5 }, // Trigger when the card is 50% in view
    );

    observer.observe(post); // Observe the post card element
  };
  const renderPostCard = ({ item }) => {
    // if (!item) return null;
    return <Text className="text-white">Item - 1</Text>;
    if (item.picture) {
      return (
        <View
          ref={(ref) =>
            handlePostInView(ref, () => {
              /* Load picture here */
            })
          }
        >
          <PicturePostCard post={item} />
        </View>
      );
    } else if (item.audio) {
      return <AudioPostCard post={item} />;
    } else {
      return <TextPostCard post={item} />;
    }
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
