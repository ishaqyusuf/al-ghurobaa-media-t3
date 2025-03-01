import { useCallback } from "react";
import { Platform, Pressable, Text, Vibration } from "react-native";

import { Icon, Icons } from "../icon";

interface MenuItemProps {
  icon?: Icons;
  children?;
  onPress?;
  onLongPress?;
}
export const MenuItem = (props: MenuItemProps) => {
  return (
    <Pressable
      className="flex-row items-center gap-4 p-4"
      android_ripple={{ color: "rgba(255, 255, 255, 0.3)" }}
      onPress={() => {
        if (props.onPress) {
          props.onPress();
        }
        if (Platform.OS === "android") {
          Vibration.vibrate(10);
        }
      }}
      onLongPress={props.onLongPress}
    >
      {props.icon && <Icon icon={props.icon} size={24} color={"white"} />}
      {typeof props.children === "string" ? (
        <Text className="text-white">{props.children}</Text>
      ) : (
        props.children
      )}
    </Pressable>
  );
};

export function menuItem(label: string, icon?: Icons, onPress?) {
  return {
    label,
    icon,
    onPress,
  };
}

export const renderMenuItem = ({ item }) => (
  <MenuItem
    icon={item.icon}
    onPress={() => {
      item?.onPress();
    }}
  >
    {item.label}
  </MenuItem>
);
