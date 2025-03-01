import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { MoreOrLess } from "react-native-more-or-less-text";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { useStore } from "~/store/store";
import { MenuItem } from "../common/menu";
import { _sheet } from "../common/sheet/provider";
import { Icon } from "../icon";
import { BlogPost } from "../type";

export const openBlogMenuSheet = (blog: BlogPost) => {
  _sheet.open({
    content: <BlogMenuSheet />,
  });
};
export const BlogMenuSheet = () => {
  const updateStore = useStore((state) => state.dotUpdate);
  const {
    menuType,
    blogMenu: blog,
    sheetOpened: opened,
  } = useStore((store) => store);

  const data = useMemo(
    () => [
      { label: "Add to Favourite", icon: "star" },
      { label: "Delete", icon: "home" },
      { label: "Select", icon: "select" },
      { label: "Add to Album", icon: "add" },
      { label: "Remove from Album", icon: "remove" },
    ],
    [],
  );
  // const handleSnapPress = useCallback((index) => {
  //   bottomSheetRef.current?.snapToIndex(index);
  // }, []);
  const renderItem = useCallback(
    ({ item }) => (
      <MenuItem icon={item.icon}>{item.label}</MenuItem>
      // <Pressable className="flex-row items-center gap-4 p-4">
      //   <Icon icon={item.icon} size={24} color={"white"} />
      //   <Text className="text-white">{item.label}</Text>
      // </Pressable>
    ),
    [],
  );

  return (
    <BottomSheetFlatList
      ListHeaderComponent={() => (
        <View>
          <View className="">
            <View className="flex-row gap-4 border-b border-muted p-4">
              <View className="size-10 rounded-sm bg-green-400"></View>
              <View className="flex-1">
                <MoreOrLess
                  numberOfLines={2}
                  textStyle={{
                    color: "white",
                    fontSize: 15,
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                  moreText=""
                >
                  {blog?.caption || blog?.content}
                </MoreOrLess>
              </View>
            </View>
          </View>
        </View>
      )}
      data={data}
      keyExtractor={(i, _) => i.label}
      renderItem={renderItem}
      contentContainerStyle={{}}
    />
  );
};
