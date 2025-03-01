import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { MoreOrLess } from "react-native-more-or-less-text";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { useStore } from "~/store/store";
import { menuItem, MenuItem, renderMenuItem } from "../common/menu";
import { _sheet } from "../common/sheet/provider";
import Text from "../common/text";

export const openBatchMenu = () => {
  _sheet.open({
    content: <BatchMenuSheet />,
  });
};
export const BatchMenuSheet = () => {
  const updateStore = useStore((state) => state.dotUpdate);
  const store = useStore();
  const data = useMemo(
    () => [
      menuItem("Unmark All", "remove", () => {
        updateStore("selection.items", {});
        updateStore("selection.count", 0);
        _sheet.close();
      }),
      menuItem("Select In Betweens", "remove", () => {
        // updateStore("selection.items", {});
        // updateStore("selection.count", 0);
        const blogs = store.blogs;
        console.log(blogs.length);

        const selection = store.selection;
        const selectedKeys = Object.keys(selection.items).sort();
        const firstId = selectedKeys[0];
        const lastId = selectedKeys[selectedKeys.length - 1];
        if (!firstId || !lastId) {
          return;
        }

        const idsInRange = blogs
          .filter((blog) => {
            const blogId = blog.id;
            return blogId >= +firstId && blogId <= +lastId;
          })
          .map((blog) => blog.id);
        const newSelectionItems = {};
        idsInRange.forEach((id) => {
          if (!newSelectionItems[id]) {
            newSelectionItems[id] = true;
          }
        });
        updateStore("selection.items", newSelectionItems);
        updateStore("selection.count", Object.keys(newSelectionItems).length);
      }),
    ],
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
                <Text>
                  {store.selection?.count} {" Selected"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
      data={data}
      keyExtractor={(i, _) => i.label}
      renderItem={renderMenuItem}
      contentContainerStyle={{}}
    />
  );
};
